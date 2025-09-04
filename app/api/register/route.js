import { NextResponse } from "next/server";
import { userRegisterSchemaWithoutOrganization } from "@/schemas/auth-schema.js";
import { User } from "@/models/user.js";
import {
  apiSuccess,
  apiConflict,
  handleApiError,
  createMethodHandler,
  createPostHandler,
} from "@/lib/api";

// Business logic handler
const handleUserRegistration = async (validatedData) => {
  const { name, email, password } = validatedData;

  console.log("🔍 [DEBUG] Starting user registration:", {
    name,
    email,
    passwordLength: password?.length || 0,
    role: "pending",
    status: "active",
  });

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  console.log("🔍 [DEBUG] User existence check:", {
    email: email.toLowerCase(),
    exists: !!existingUser,
    existingUserId: existingUser?._id,
    existingUserRole: existingUser?.role,
    existingUserStatus: existingUser?.status,
  });

  if (existingUser) {
    console.log("❌ [DEBUG] User already exists, returning conflict error");
    return NextResponse.json(
      apiConflict("User with this email already exists"),
      { status: 409 }
    );
  }

  // Create and save user
  console.log("🔍 [DEBUG] Creating new user with data:", {
    name,
    email: email.toLowerCase(),
    role: "pending",
    status: "active",
    emailVerified: true,
    permissions: [],
  });

  const user = new User({
    name,
    email: email.toLowerCase(),
    password,
    role: "pending",
    status: "active",
    emailVerified: true,
    permissions: [],
  });

  console.log("🔍 [DEBUG] Saving user to database...");
  await user.save();
  console.log("✅ [DEBUG] User saved successfully:", {
    userId: user._id,
    email: user.email,
    role: user.role,
    status: user.status,
    emailVerified: user.emailVerified,
    permissions: user.permissions,
    organizationId: user.organizationId,
  });

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
    hasPassword: !!userResponse.password,
    hasInviteToken: !!userResponse.inviteToken,
  });

  console.log("✅ [DEBUG] Returning success response");
  return NextResponse.json(
    apiSuccess({
      data: userResponse,
      message:
        "User registered successfully. Please create an organization to complete setup.",
      statusCode: 201,
    }),
    { status: 201 }
  );
};

// POST /api/register - Register a new user (without organization)
export const POST = createPostHandler(
  userRegisterSchemaWithoutOrganization,
  async (validatedData) => {
    console.log("🚀 [DEBUG] User registration endpoint called");
    try {
      return await handleUserRegistration(validatedData);
    } catch (error) {
      console.log("❌ [DEBUG] User registration error:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      return NextResponse.json(
        handleApiError(error, "Failed to register user. Please try again."),
        { status: 500 }
      );
    }
  }
);

// Fallback for unsupported HTTP methods
export const { GET, PUT, DELETE } = createMethodHandler(["POST"]);
