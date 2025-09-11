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

  // Only super_admin can transfer ownership
  if (!hasRole(currentUser, "super_admin")) {
    return forbidden("INSUFFICIENT_PERMISSIONS");
  }

  // Find organization with current owner
  const organization = await Organization.findById(organizationId).select(
    "owner name"
  );
  if (!organization) {
    return notFound("ORGANIZATION_NOT_FOUND");
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

  const oldOwnerId = organization.owner;
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
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

      // Log the ownership transfer
      await logUpdate(
        "Organization",
        { owner: oldOwnerId },
        { owner: newOwnerId },
        currentUser,
        request
      );
    });

    return apiSuccess("OWNERSHIP_TRANSFERRED_SUCCESSFULLY", {
      organizationId,
      oldOwnerId,
      newOwnerId,
      organizationName: organization.name,
    });
  } catch (error) {
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
