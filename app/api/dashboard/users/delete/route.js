import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { User } from "@/models/user";
import { getApiErrorMessages } from "@/lib/helpers/error-messages";
import {
  apiSuccess,
  apiNotFound,
  apiError,
  handleApiError,
  createMethodHandler,
  createDeleteHandler,
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
 * Business logic handler for deleting a user
 * Implements role-based permissions and organization scoping
 */
const handleUserDelete = async (queryParams) => {
  const { userId } = queryParams;
  const currentUser = await getAuthenticatedUser();

  // Find target user
  const targetUser = await User.findById(userId).select(
    "-password -inviteToken -__v"
  );
  if (!targetUser) {
    throw new Error("TARGET_USER_NOT_FOUND");
  }

  // Check if user is trying to delete themselves
  const isSelfDelete = currentUser._id.toString() === targetUser._id.toString();

  // Role-based permission checks
  if (currentUser.role === "staff") {
    // Staff cannot delete anyone
    throw new Error("INSUFFICIENT_PERMISSIONS");
  } else if (currentUser.role === "admin") {
    // Admin can only delete staff in their organization
    if (
      !currentUser.organizationId ||
      !targetUser.organizationId ||
      currentUser.organizationId.toString() !==
        targetUser.organizationId.toString()
    ) {
      throw new Error("INSUFFICIENT_PERMISSIONS");
    }

    // Admin cannot delete other admins or themselves
    if (targetUser.role === "admin" || isSelfDelete) {
      throw new Error("CANNOT_DELETE_ADMIN");
    }
  } else if (currentUser.role === "super_admin") {
    // Super admin can delete anyone except themselves
    if (isSelfDelete) {
      throw new Error("CANNOT_DELETE_SELF");
    }
  } else {
    // Pending users can't delete anyone
    throw new Error("INSUFFICIENT_PERMISSIONS");
  }

  // Check if user has any critical dependencies (e.g., created orders, etc.)
  // For now, we'll allow deletion but this could be extended to check for dependencies

  // Delete user
  const deletedUser = await User.findByIdAndDelete(userId);
  if (!deletedUser) {
    throw new Error("DELETE_FAILED");
  }

  // Format response data (exclude sensitive fields)
  const userResponse = {
    id: deletedUser._id,
    name: deletedUser.name,
    email: deletedUser.email,
    role: deletedUser.role,
    status: deletedUser.status,
    permissions: deletedUser.permissions,
    emailVerified: deletedUser.emailVerified,
    createdAt: deletedUser.createdAt,
    organizationId: deletedUser.organizationId,
  };

  return NextResponse.json(
    apiSuccess({
      data: userResponse,
      message: "User deleted successfully",
    }),
    { status: 200 }
  );
};

/**
 * DELETE /api/dashboard/users/delete?userId=<id>
 * Delete a user based on role-based permissions
 */
export const DELETE = createDeleteHandler(async (queryParams) => {
  try {
    return await handleUserDelete(queryParams);
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
      case "INSUFFICIENT_PERMISSIONS":
        return NextResponse.json(
          apiError(getApiErrorMessages("INSUFFICIENT_PERMISSIONS")),
          { status: 403 }
        );
      case "CANNOT_DELETE_ADMIN":
        return NextResponse.json(
          apiError(getApiErrorMessages("CANNOT_DELETE_ADMIN")),
          { status: 403 }
        );
      case "CANNOT_DELETE_SELF":
        return NextResponse.json(
          apiError(getApiErrorMessages("CANNOT_DELETE_SELF")),
          { status: 400 }
        );
      case "DELETE_FAILED":
        return NextResponse.json(
          apiError(getApiErrorMessages("DELETE_FAILED")),
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
});

// Fallback for unsupported HTTP methods
export const { GET, POST, PUT } = createMethodHandler(["DELETE"]);
