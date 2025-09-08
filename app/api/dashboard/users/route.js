import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { User } from "@/models/user";
import { Organization } from "@/models/organization";
import { getApiErrorMessages } from "@/lib/helpers/error-messages";
import {
  apiSuccess,
  apiNotFound,
  apiError,
  handleApiError,
  createMethodHandler,
  createGetRouteHandler,
} from "@/lib/api-utils";

/**
 * Format user data for response (excludes sensitive fields)
 */
const formatUserData = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  permissions: user.permissions,
  lastLogin: user.lastLogin,
  emailVerified: user.emailVerified,
  createdAt: user.createdAt,
  organizationId: user.organizationId,
});

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
 * Business logic handler for fetching users
 * Returns users based on authenticated user's role and permissions
 */
const handleUsersData = async (queryParams, request) => {
  const currentUser = await getAuthenticatedUser();

  let users = [];
  let organizationData = null;

  // Role-based data fetching
  switch (currentUser.role) {
    case "super_admin":
      // Super admin can see all users across all organizations
      users = await User.find({})
        .populate("organizationId", "name")
        .select("-password -inviteToken -__v")
        .sort({ createdAt: -1 });
      break;

    case "admin":
      // Admin can only see users in their organization
      if (!currentUser.organizationId) {
        throw new Error("ORGANIZATION_NOT_FOUND");
      }

      // Verify organization exists
      const organization = await Organization.findById(
        currentUser.organizationId
      ).select("-__v");
      if (!organization) {
        throw new Error("ORGANIZATION_NOT_FOUND");
      }

      organizationData = {
        id: organization._id,
        name: organization.name,
      };

      // Get all users in the organization
      users = await User.find({
        organizationId: currentUser.organizationId,
      })
        .select("-password -inviteToken -__v")
        .sort({ createdAt: -1 });
      break;

    case "staff":
      // Staff can only see themselves
      users = [currentUser];
      break;

    default:
      // Pending users can't access this endpoint
      throw new Error("INSUFFICIENT_PERMISSIONS");
  }

  // Format response data
  const formattedUsers = users.map(formatUserData);

  return NextResponse.json(
    apiSuccess({
      data: {
        users: formattedUsers,
        organization: organizationData,
        currentUser: formatUserData(currentUser),
      },
      message: "Users retrieved successfully",
    }),
    { status: 200 }
  );
};

/**
 * GET /api/dashboard/users
 * Get users based on authenticated user's role and permissions
 */
export const GET = createGetRouteHandler(async (queryParams, request) => {
  try {
    return await handleUsersData(queryParams, request);
  } catch (error) {
    // Handle specific authentication and data errors
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
      case "ORGANIZATION_NOT_FOUND":
        return NextResponse.json(
          apiNotFound(getApiErrorMessages("ORGANIZATION_NOT_FOUND")),
          { status: 404 }
        );
      case "INSUFFICIENT_PERMISSIONS":
        return NextResponse.json(
          apiError(getApiErrorMessages("INSUFFICIENT_PERMISSIONS")),
          { status: 403 }
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
export const { POST, PUT, DELETE } = createMethodHandler(["GET"]);
