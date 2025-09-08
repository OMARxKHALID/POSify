import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { User } from "@/models/user";
import { userEditSchema } from "@/schemas/auth-schema";
import { DEFAULT_PERMISSIONS } from "@/constants/users";
import { getApiErrorMessages } from "@/lib/helpers/error-messages";
import {
  apiSuccess,
  apiNotFound,
  apiError,
  handleApiError,
  createMethodHandler,
  createPutHandler,
} from "@/lib/api-utils";

/**
 * Get authenticated user from session
 */
const getAuthenticatedUser = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("AUTHENTICATION_REQUIRED");
  }

  const currentUser = await User.findById(session.user.id).select(
    "-password -inviteToken -__v"
  );

  if (!currentUser) {
    throw new Error("USER_NOT_FOUND");
  }

  return currentUser;
};

/**
 * Business logic handler for editing a user
 * Implements role-based permissions and self-update restrictions
 */
const handleUserEdit = async (validatedData, queryParams) => {
  const { userId } = queryParams;
  const updateData = validatedData;
  const currentUser = await getAuthenticatedUser();

  // Find target user
  // Validate user ID format
  if (!userId || typeof userId !== "string") {
    throw new Error("INVALID_USER_ID");
  }

  const targetUser = await User.findById(userId).select(
    "-password -inviteToken -__v"
  );
  if (!targetUser) {
    throw new Error("TARGET_USER_NOT_FOUND");
  }

  // Check if user is trying to edit themselves
  const isSelfEdit = currentUser._id.toString() === targetUser._id.toString();

  // Role-based permission checks
  if (currentUser.role === "staff") {
    // Staff can only edit their own password
    if (!isSelfEdit) {
      throw new Error("INSUFFICIENT_PERMISSIONS");
    }

    // Staff can only update password
    const allowedFields = ["password"];
    const providedFields = Object.keys(updateData);
    const hasInvalidFields = providedFields.some(
      (field) => !allowedFields.includes(field)
    );

    if (hasInvalidFields) {
      throw new Error("INVALID_FIELDS_FOR_STAFF");
    }
  } else if (currentUser.role === "admin") {
    // Admin can edit staff in their organization or themselves
    if (!isSelfEdit) {
      // Check if target user is in the same organization
      if (
        !currentUser.organizationId ||
        !targetUser.organizationId ||
        currentUser.organizationId.toString() !==
          targetUser.organizationId.toString()
      ) {
        throw new Error("INSUFFICIENT_PERMISSIONS");
      }

      // Admin cannot edit other admins
      if (targetUser.role === "admin") {
        throw new Error("CANNOT_EDIT_ADMIN");
      }
    }

    // Admin can edit their own permissions but only within default limits
    if (isSelfEdit && updateData.permissions) {
      const defaultPermissions = DEFAULT_PERMISSIONS.admin || [];
      const validPermissions = updateData.permissions.filter((perm) =>
        defaultPermissions.includes(perm)
      );
      updateData.permissions = validPermissions;
    }

    // Admin can edit staff permissions but only within staff default limits
    if (!isSelfEdit && updateData.permissions && targetUser.role === "staff") {
      const defaultPermissions = DEFAULT_PERMISSIONS.staff || [];
      const validPermissions = updateData.permissions.filter((perm) =>
        defaultPermissions.includes(perm)
      );
      updateData.permissions = validPermissions;
    }
  } else if (currentUser.role === "super_admin") {
    // Super admin can edit anyone except themselves (limited self-edit)
    if (isSelfEdit) {
      // Super admin cannot deactivate or delete themselves
      if (updateData.status && updateData.status !== "active") {
        throw new Error("CANNOT_DEACTIVATE_SELF");
      }
    }
  } else {
    // Pending users can't edit anyone
    throw new Error("INSUFFICIENT_PERMISSIONS");
  }

  // Check if email is being changed and if it already exists
  if (updateData.email && updateData.email !== targetUser.email) {
    const existingUser = await User.findOne({
      email: updateData.email.toLowerCase(),
      _id: { $ne: targetUser._id },
    });
    if (existingUser) {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }
    updateData.email = updateData.email.toLowerCase();
  }

  // Handle password update - only update if password is provided and not empty
  if (updateData.password !== undefined) {
    if (updateData.password && updateData.password.trim() !== "") {
      // Hash the new password
      const bcrypt = await import("bcryptjs");
      updateData.password = await bcrypt.hash(updateData.password, 12);
    } else {
      // Remove password from update if it's empty
      delete updateData.password;
    }
  }

  // Update lastModifiedBy
  updateData.lastModifiedBy = currentUser._id;

  // Update user
  const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  }).select("-password -inviteToken -__v");

  if (!updatedUser) {
    throw new Error("UPDATE_FAILED");
  }

  // Format response data
  const userResponse = {
    id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    status: updatedUser.status,
    permissions: updatedUser.permissions,
    lastLogin: updatedUser.lastLogin,
    emailVerified: updatedUser.emailVerified,
    createdAt: updatedUser.createdAt,
    organizationId: updatedUser.organizationId,
  };

  return NextResponse.json(
    apiSuccess({
      data: userResponse,
      message: "User updated successfully",
    }),
    { status: 200 }
  );
};

/**
 * PUT /api/dashboard/users/edit?userId=<id>
 * Edit a user based on role-based permissions
 */
export const PUT = createPutHandler(
  userEditSchema,
  async (validatedData, request) => {
    try {
      // Extract userId from URL search params
      const url = new URL(request.url);
      const userId = url.searchParams.get("userId");

      return await handleUserEdit(validatedData, { userId });
    } catch (error) {
      // Handle specific errors
      switch (error.message) {
        case "AUTHENTICATION_REQUIRED":
          return NextResponse.json(
            apiError(getApiErrorMessages("AUTHENTICATION_REQUIRED")),
            {
              status: 401,
            }
          );
        case "USER_NOT_FOUND":
          return NextResponse.json(
            apiNotFound(getApiErrorMessages("USER_NOT_FOUND")),
            { status: 404 }
          );
        case "TARGET_USER_NOT_FOUND":
          return NextResponse.json(
            apiNotFound(getApiErrorMessages("TARGET_USER_NOT_FOUND")),
            { status: 404 }
          );
        case "INVALID_USER_ID":
          return NextResponse.json(
            apiError(getApiErrorMessages("INVALID_USER_ID")),
            { status: 400 }
          );
        case "INSUFFICIENT_PERMISSIONS":
          return NextResponse.json(
            apiError(getApiErrorMessages("INSUFFICIENT_PERMISSIONS")),
            { status: 403 }
          );
        case "INVALID_FIELDS_FOR_STAFF":
          return NextResponse.json(
            apiError(getApiErrorMessages("INVALID_FIELDS_FOR_STAFF")),
            { status: 400 }
          );
        case "CANNOT_EDIT_ADMIN":
          return NextResponse.json(
            apiError(getApiErrorMessages("CANNOT_EDIT_ADMIN")),
            { status: 403 }
          );
        case "CANNOT_DEACTIVATE_SELF":
          return NextResponse.json(
            apiError(getApiErrorMessages("CANNOT_DEACTIVATE_SELF")),
            { status: 400 }
          );
        case "EMAIL_ALREADY_EXISTS":
          return NextResponse.json(
            apiError(getApiErrorMessages("EMAIL_ALREADY_EXISTS")),
            { status: 409 }
          );
        case "UPDATE_FAILED":
          return NextResponse.json(
            apiError(getApiErrorMessages("UPDATE_FAILED")),
            { status: 500 }
          );
        default:
          // Handle other errors
          return NextResponse.json(
            handleApiError(error, getApiErrorMessages("OPERATION_FAILED")),
            { status: 500 }
          );
      }
    }
  }
);

// Fallback for unsupported HTTP methods
export const { GET, POST, DELETE } = createMethodHandler(["PUT"]);
