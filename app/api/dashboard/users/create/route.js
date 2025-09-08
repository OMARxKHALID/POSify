import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { User } from "@/models/user";
import { Organization } from "@/models/organization";
import { userCreationSchema } from "@/schemas/auth-schema";
import { DEFAULT_PERMISSIONS } from "@/constants/users";
import { getApiErrorMessages } from "@/lib/helpers/error-messages";
import {
  apiSuccess,
  apiConflict,
  apiError,
  handleApiError,
  createMethodHandler,
  createPostHandler,
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
 * Business logic handler for creating a new user
 * Only admins can create staff users in their organization
 */
const handleUserCreation = async (validatedData) => {
  const { name, email, password, role = "staff", permissions } = validatedData;
  const currentUser = await getAuthenticatedUser();

  // Only admins can create users
  if (currentUser.role !== "admin") {
    throw new Error("INSUFFICIENT_PERMISSIONS");
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new Error("USER_EXISTS");
  }

  // Admin can only create staff users in their organization
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

  // Admin can only create staff users
  if (role !== "staff") {
    throw new Error("INVALID_ROLE_FOR_ADMIN");
  }

  const targetOrganizationId = currentUser.organizationId;

  // Set default permissions based on role
  const defaultPermissions = DEFAULT_PERMISSIONS[role] || [];
  const finalPermissions =
    permissions && permissions.length > 0
      ? permissions.filter((perm) => defaultPermissions.includes(perm))
      : defaultPermissions;

  // Create new user
  const newUser = new User({
    name,
    email: email.toLowerCase(),
    password,
    role,
    status: "active",
    emailVerified: true,
    permissions: finalPermissions,
    organizationId: targetOrganizationId,
    createdBy: currentUser._id,
  });

  await newUser.save();

  // Format response data (exclude sensitive fields)
  const userResponse = {
    id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    status: newUser.status,
    permissions: newUser.permissions,
    emailVerified: newUser.emailVerified,
    organizationId: newUser.organizationId,
    createdAt: newUser.createdAt,
  };

  return NextResponse.json(
    apiSuccess({
      data: userResponse,
      message: "User created successfully",
      statusCode: 201,
    }),
    { status: 201 }
  );
};

/**
 * POST /api/dashboard/users/create
 * Create a new user (admin/super_admin only)
 */
export const POST = createPostHandler(
  userCreationSchema,
  async (validatedData) => {
    try {
      return await handleUserCreation(validatedData);
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
        case "USER_EXISTS":
          return NextResponse.json(
            apiConflict(getApiErrorMessages("USER_EXISTS")),
            { status: 409 }
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
        case "INVALID_ROLE_FOR_ADMIN":
          return NextResponse.json(
            apiError(getApiErrorMessages("INVALID_ROLE_FOR_ADMIN")),
            { status: 400 }
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
export const { GET, PUT, DELETE } = createMethodHandler(["POST"]);
