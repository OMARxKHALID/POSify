import { NextResponse } from "next/server";
import { userRegistrationSchema } from "@/schemas/auth-schema";
import { User } from "@/models/user";
import { getApiErrorMessages } from "@/lib/helpers/error-messages";
import {
  apiSuccess,
  apiConflict,
  apiError,
  handleApiError,
  createMethodHandler,
  createPostHandler,
} from "@/lib/api-utils";
import { DEFAULT_PERMISSIONS } from "@/constants";

/**
 * Business logic handler for super admin registration
 * Creates a super admin user with full system permissions
 */
const handleSuperAdminRegistration = async (validatedData) => {
  const { name, email, password } = validatedData;

  // Check if super admin already exists
  const existingSuperAdmin = await User.findOne({ role: "super_admin" });
  if (existingSuperAdmin) {
    throw new Error("SUPER_ADMIN_EXISTS");
  }

  // Check if user with this email already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new Error("USER_EXISTS");
  }

  // Create and save super admin
  const user = new User({
    name,
    email: email.toLowerCase(),
    password,
    role: "super_admin",
    status: "active",
    emailVerified: true,
    permissions: DEFAULT_PERMISSIONS.super_admin,
    permissionsUpdatedAt: new Date(),
  });

  await user.save();

  // Remove sensitive data
  const userResponse = user.toJSON();
  delete userResponse.password;
  delete userResponse.inviteToken;

  return NextResponse.json(
    apiSuccess({
      data: userResponse,
      message: "Super admin registered successfully",
      statusCode: 201,
    }),
    { status: 201 }
  );
};

/**
 * POST /api/register/super-admin
 * Register a super admin user
 */
export const POST = createPostHandler(
  userRegistrationSchema,
  async (validatedData) => {
    try {
      return await handleSuperAdminRegistration(validatedData);
    } catch (error) {
      // Handle specific errors
      switch (error.message) {
        case "SUPER_ADMIN_EXISTS":
          return NextResponse.json(
            apiError(getApiErrorMessages("SUPER_ADMIN_EXISTS")),
            { status: 409 }
          );
        case "USER_EXISTS":
          return NextResponse.json(
            apiConflict(getApiErrorMessages("USER_EXISTS")),
            { status: 409 }
          );
        default:
          // Handle other errors
          return NextResponse.json(
            handleApiError(error, getApiErrorMessages("REGISTRATION_FAILED")),
            { status: 500 }
          );
      }
    }
  }
);

// Fallback for unsupported HTTP methods
export const { GET, PUT, DELETE } = createMethodHandler(["POST"]);
