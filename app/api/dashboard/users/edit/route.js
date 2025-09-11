import mongoose from "mongoose";
import { User } from "@/models/user";
import { userEditSchema } from "@/schemas/auth-schema";
import { DEFAULT_PERMISSIONS } from "@/constants";
import { logUpdate } from "@/lib/helpers/audit-helpers";
import {
  getAuthenticatedUser,
  cleanUserResponse,
  createMethodHandler,
  createPutHandler,
  apiSuccess,
  badRequest,
  notFound,
  forbidden,
  serverError,
} from "@/lib/api";

/**
 * Handle user editing with role-based permissions and validation
 */
const handleUserEdit = async (validatedData, queryParams, request) => {
  const { userId } = queryParams;
  const updateData = validatedData;
  const currentUser = await getAuthenticatedUser();

  // Validate user ID parameter
  if (!userId || typeof userId !== "string") {
    return badRequest("INVALID_USER_ID");
  }

  // Find target user
  const targetUser = await User.findById(userId).select(
    "-password -inviteToken -__v"
  );
  if (!targetUser) {
    return notFound("TARGET_USER_NOT_FOUND");
  }

  const isSelfEdit = currentUser._id.toString() === targetUser._id.toString();

  // Role-based checks
  if (currentUser.role === "staff") {
    if (!isSelfEdit) {
      return forbidden("INSUFFICIENT_PERMISSIONS");
    }

    // Staff: only password updates allowed
    const allowedFields = ["password"];
    const providedFields = Object.keys(updateData);
    const hasInvalidFields = providedFields.some(
      (field) => !allowedFields.includes(field)
    );

    if (hasInvalidFields) {
      return badRequest("INVALID_FIELDS_FOR_STAFF");
    }
  } else if (currentUser.role === "admin") {
    if (!isSelfEdit) {
      if (
        !currentUser.organizationId ||
        !targetUser.organizationId ||
        currentUser.organizationId.toString() !==
          targetUser.organizationId.toString()
      ) {
        return forbidden("INSUFFICIENT_PERMISSIONS");
      }

      if (targetUser.role === "admin") {
        return forbidden("CANNOT_EDIT_ADMIN");
      }
    }

    if (isSelfEdit && updateData.permissions) {
      const defaultPermissions = DEFAULT_PERMISSIONS.admin || [];
      updateData.permissions = updateData.permissions.filter((perm) =>
        defaultPermissions.includes(perm)
      );
    }

    if (!isSelfEdit && updateData.permissions && targetUser.role === "staff") {
      const defaultPermissions = DEFAULT_PERMISSIONS.staff || [];
      updateData.permissions = updateData.permissions.filter((perm) =>
        defaultPermissions.includes(perm)
      );
    }

    if (isSelfEdit && updateData.permissions && currentUser.role === "admin") {
      const defaultPermissions = DEFAULT_PERMISSIONS.admin || [];
      updateData.permissions = updateData.permissions.filter((perm) =>
        defaultPermissions.includes(perm)
      );
    }
  } else if (currentUser.role === "super_admin") {
    if (isSelfEdit && updateData.status && updateData.status !== "active") {
      return forbidden("CANNOT_DEACTIVATE_SELF");
    }
  } else {
    return forbidden("INSUFFICIENT_PERMISSIONS");
  }

  // Email uniqueness check
  if (updateData.email && updateData.email !== targetUser.email) {
    const existingUser = await User.findOne({
      email: updateData.email.toLowerCase(),
      _id: { $ne: targetUser._id },
    });
    if (existingUser) {
      return badRequest("EMAIL_ALREADY_EXISTS");
    }
    updateData.email = updateData.email.toLowerCase();
  }

  // Org ID validation
  if (
    updateData.role &&
    (updateData.role === "admin" || updateData.role === "staff")
  ) {
    if (!targetUser.organizationId && !currentUser.organizationId) {
      return badRequest("ORGANIZATION_REQUIRED");
    }
    if (!updateData.organizationId) {
      updateData.organizationId =
        targetUser.organizationId || currentUser.organizationId;
    }
  }

  // Password handling
  if (updateData.password !== undefined) {
    if (updateData.password && updateData.password.trim() !== "") {
      const bcrypt = await import("bcryptjs");
      updateData.password = await bcrypt.hash(updateData.password, 12);
    } else {
      delete updateData.password;
    }
  }

  const oldUser = targetUser.toObject ? targetUser.toObject() : targetUser;
  updateData.lastModifiedBy = currentUser._id;

  // Note: Ownership transfer is handled separately via dedicated transfer endpoint
  // This prevents automatic ownership changes when multiple staff members exist

  // Update user with transaction
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
        session,
      }).select("-password -inviteToken -__v");

      if (!updatedUser) {
        throw new Error("UPDATE_FAILED");
      }

      await logUpdate("User", oldUser, updatedUser, currentUser, request);
    });

    // Fetch updated user after transaction
    const updatedUser = await User.findById(userId).select(
      "-password -inviteToken -__v"
    );
    const userResponse = cleanUserResponse(updatedUser);

    return apiSuccess("USER_UPDATED_SUCCESSFULLY", userResponse);
  } catch (error) {
    return serverError("UPDATE_FAILED");
  } finally {
    await session.endSession();
  }
};

/**
 * PUT /api/dashboard/users/edit?userId=<id>
 */
export const PUT = createPutHandler(
  userEditSchema,
  async (validatedData, request) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    return await handleUserEdit(validatedData, { userId }, request);
  }
);

export const { GET, POST, DELETE } = createMethodHandler(["PUT"]);
