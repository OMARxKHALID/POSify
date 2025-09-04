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
import { DEFAULT_PERMISSIONS } from "@/constants";

// Business logic handler
const handleSuperAdminRegistration = async (validatedData) => {
  console.log("🚀 [DEBUG] Starting super admin registration:", {
    name: validatedData.name,
    email: validatedData.email,
    passwordLength: validatedData.password?.length || 0,
    hasPassword: !!validatedData.password,
  });

  const { name, email, password } = validatedData;

  console.log("🔍 [DEBUG] Checking if super admin already exists...");
  // Check if super admin already exists
  const existingSuperAdmin = await User.findOne({ role: "super_admin" });
  console.log("🔍 [DEBUG] Super admin existence check:", {
    exists: !!existingSuperAdmin,
    existingSuperAdminId: existingSuperAdmin?._id,
    existingSuperAdminEmail: existingSuperAdmin?.email,
    existingSuperAdminName: existingSuperAdmin?.name,
  });

  if (existingSuperAdmin) {
    console.log(
      "❌ [DEBUG] Super admin already exists, returning conflict error"
    );
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
  console.log("✅ [DEBUG] No existing super admin found");

  console.log("🔍 [DEBUG] Checking if user with email already exists:", {
    email: email.toLowerCase(),
  });
  // Check if user with this email already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  console.log("🔍 [DEBUG] User email existence check:", {
    exists: !!existingUser,
    existingUserId: existingUser?._id,
    existingUserEmail: existingUser?.email,
    existingUserName: existingUser?.name,
    existingUserRole: existingUser?.role,
    existingUserStatus: existingUser?.status,
  });

  if (existingUser) {
    console.log(
      "❌ [DEBUG] User with email already exists, returning conflict error"
    );
    return NextResponse.json(
      apiConflict("User with this email already exists"),
      { status: 409 }
    );
  }
  console.log("✅ [DEBUG] No existing user with this email found");

  console.log("🔍 [DEBUG] Creating new super admin user with data:", {
    name,
    email: email.toLowerCase(),
    role: "super_admin",
    status: "active",
    emailVerified: true,
    permissions: DEFAULT_PERMISSIONS.super_admin,
    permissionsUpdatedAt: new Date(),
  });

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

  console.log("🔍 [DEBUG] Saving super admin user to database...");
  await user.save();
  console.log("✅ [DEBUG] Super admin user saved successfully:", {
    userId: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
    emailVerified: user.emailVerified,
    permissions: user.permissions,
    permissionsUpdatedAt: user.permissionsUpdatedAt,
  });

  console.log(
    "🔍 [DEBUG] Preparing user response (removing sensitive data)..."
  );
  // Remove sensitive data
  const userResponse = user.toJSON();
  delete userResponse.password;
  delete userResponse.inviteToken;

  console.log("🔍 [DEBUG] User response prepared:", {
    userId: userResponse._id,
    email: userResponse.email,
    name: userResponse.name,
    role: userResponse.role,
    status: userResponse.status,
    emailVerified: userResponse.emailVerified,
    hasPassword: !!userResponse.password,
    hasInviteToken: !!userResponse.inviteToken,
    permissions: userResponse.permissions,
  });

  console.log("✅ [DEBUG] Returning success response");
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
    console.log("🚀 [DEBUG] Super admin registration endpoint called");
    try {
      return await handleSuperAdminRegistration(validatedData);
    } catch (error) {
      console.log("❌ [DEBUG] Super admin registration error:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      return NextResponse.json(
        handleApiError(error, "Failed to register super admin"),
        { status: 500 }
      );
    }
  }
);

// Fallback for unsupported HTTP methods
export const { GET, PUT, DELETE } = createMethodHandler(["POST"]);
