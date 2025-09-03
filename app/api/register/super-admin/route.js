import { NextResponse } from "next/server";
import { superAdminRegisterSchema } from "@/schemas/auth-schema.js";
import { User } from "@/models/user.js";
import {
  apiSuccess,
  apiConflict,
  apiError,
  handleApiError,
  createMethodHandler,
  createPostHandler,
} from "@/lib/api";
import { DefaultPermissions } from "@/constants";

// Business logic handler
const handleSuperAdminRegistration = async (validatedData) => {
  const { name, email, password } = validatedData;

  // Check if super admin already exists
  const existingSuperAdmin = await User.findOne({ role: "super_admin" });
  if (existingSuperAdmin) {
    return NextResponse.json(
      apiError(
        "Super admin already exists",
        "SUPER_ADMIN_EXISTS",
        [
          {
            field: "role",
            issue: "Only one super admin is allowed in the system",
          },
        ],
        409
      ),
      { status: 409 }
    );
  }

  // Check if user with this email already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return NextResponse.json(
      apiConflict("User with this email already exists"),
      { status: 409 }
    );
  }

  // Create and save super admin
  const user = new User({
    name,
    email: email.toLowerCase(),
    password,
    role: "super_admin",
    status: "active",
    emailVerified: true,
    permissions: DefaultPermissions.super_admin,
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

// POST /api/register/super-admin - Register a super admin user
export const POST = createPostHandler(
  superAdminRegisterSchema,
  async (validatedData) => {
    try {
      return await handleSuperAdminRegistration(validatedData);
    } catch (error) {
      return NextResponse.json(
        handleApiError(error, "Failed to register super admin"),
        { status: 500 }
      );
    }
  }
);

// Fallback for unsupported HTTP methods
export const { GET, PUT, DELETE } = createMethodHandler(["POST"]);
