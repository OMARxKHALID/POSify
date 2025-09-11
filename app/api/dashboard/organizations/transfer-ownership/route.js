import mongoose from "mongoose";
import { User } from "@/models/user";
import { Organization } from "@/models/organization";
import { organizationTransferSchema } from "@/schemas/auth-schema";
import { DEFAULT_PERMISSIONS } from "@/constants";
import { logUpdate } from "@/lib/helpers/audit-helpers";
import {
  getAuthenticatedUser,
  hasRole,
  createMethodHandler,
  createPostHandler,
  apiSuccess,
  badRequest,
  notFound,
  forbidden,
  serverError,
} from "@/lib/api";

/**
 * Handle organization ownership transfer from current admin to a staff member
 */
const handleOwnershipTransfer = async (validatedData, request) => {
  const { organizationId, newOwnerId } = validatedData;

  const currentUser = await getAuthenticatedUser();

  // Only super_admin or admin (organization owner) can transfer ownership
  if (!hasRole(currentUser, "super_admin") && !hasRole(currentUser, "admin")) {
    return forbidden("INSUFFICIENT_PERMISSIONS");
  }

  // If admin, they can only transfer ownership of their own organization
  if (
    hasRole(currentUser, "admin") &&
    currentUser.organizationId?.toString() !== organizationId
  ) {
    return forbidden("INSUFFICIENT_PERMISSIONS");
  }

  // Find organization with current owner and validate status
  const organization = await Organization.findById(organizationId).select(
    "owner name status usage"
  );
  if (!organization) {
    return notFound("ORGANIZATION_NOT_FOUND");
  }

  // Validate organization is active
  if (organization.status !== "active") {
    return badRequest("ORGANIZATION_INACTIVE");
  }

  // Find new owner (must be staff in the same organization)
  const newOwner = await User.findById(newOwnerId).select(
    "-password -inviteToken -__v"
  );
  if (!newOwner) {
    return notFound("TARGET_USER_NOT_FOUND");
  }

  // Validate new owner is staff in the same organization
  if (
    newOwner.role !== "staff" ||
    !newOwner.organizationId ||
    newOwner.organizationId.toString() !== organizationId
  ) {
    return badRequest("INVALID_NEW_OWNER");
  }

  // Validate new owner is active
  if (newOwner.status !== "active") {
    return badRequest("INACTIVE_NEW_OWNER");
  }

  // For admin users, ensure they are the current owner
  if (
    hasRole(currentUser, "admin") &&
    organization.owner.toString() !== currentUser._id.toString()
  ) {
    return forbidden("INSUFFICIENT_PERMISSIONS");
  }

  // Prevent self-transfer
  if (newOwnerId === currentUser._id.toString()) {
    return badRequest("CANNOT_TRANSFER_TO_SELF");
  }

  const oldOwnerId = organization.owner;

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      // Double-check ownership hasn't changed during the request (concurrent protection)
      const currentOrg = await Organization.findById(organizationId).session(
        session
      );
      if (currentOrg.owner.toString() !== oldOwnerId.toString()) {
        throw new Error("OWNERSHIP_ALREADY_TRANSFERRED");
      }

      // Update organization owner
      await Organization.findByIdAndUpdate(
        organizationId,
        {
          owner: newOwnerId,
          lastModifiedBy: currentUser._id,
        },
        { session }
      );

      // Promote new owner to admin
      await User.findByIdAndUpdate(
        newOwnerId,
        {
          role: "admin",
          permissions: DEFAULT_PERMISSIONS.admin,
          permissionsUpdatedAt: new Date(),
          lastModifiedBy: currentUser._id,
        },
        { session }
      );

      // Demote old owner to staff (if they still exist)
      const oldOwner = await User.findById(oldOwnerId);
      if (oldOwner && oldOwner.role === "admin") {
        await User.findByIdAndUpdate(
          oldOwnerId,
          {
            role: "staff",
            permissions: DEFAULT_PERMISSIONS.staff,
            permissionsUpdatedAt: new Date(),
            lastModifiedBy: currentUser._id,
          },
          { session }
        );
      }

      // Update organization usage tracking (no change in user count, just ownership)
      // Note: currentUsers count remains the same as we're not adding/removing users

      // Log the ownership transfer
      await logUpdate(
        "Organization",
        { _id: organizationId, owner: oldOwnerId },
        { _id: organizationId, owner: newOwnerId },
        currentUser,
        request
      );

      // Log the user role changes for audit trail
      await logUpdate(
        "User",
        { _id: newOwnerId, role: "staff" },
        { _id: newOwnerId, role: "admin" },
        currentUser,
        request
      );

      await logUpdate(
        "User",
        { _id: oldOwnerId, role: "admin" },
        { _id: oldOwnerId, role: "staff" },
        currentUser,
        request
      );
    });

    const response = apiSuccess("OWNERSHIP_TRANSFERRED_SUCCESSFULLY", {
      organizationId,
      oldOwnerId,
      newOwnerId,
      organizationName: organization.name,
      ownershipTransferred: true,
      message:
        "Organization ownership has been transferred successfully. You will be logged out.",
      logoutRequired: true,
    });

    return response;
  } catch (error) {
    // Handle specific business logic errors
    if (error.message === "OWNERSHIP_ALREADY_TRANSFERRED") {
      return badRequest("OWNERSHIP_ALREADY_TRANSFERRED");
    }

    // Handle unexpected errors
    return serverError("TRANSFER_FAILED");
  } finally {
    await session.endSession();
  }
};

/**
 * POST /api/dashboard/organizations/transfer-ownership
 * Transfer organization ownership from current admin to a staff member
 */
export const POST = createPostHandler(
  organizationTransferSchema,
  handleOwnershipTransfer
);

// Fallback for unsupported HTTP methods
export const { GET, PUT, DELETE } = createMethodHandler(["POST"]);
