import { NextResponse } from "next/server";
import { userRegistrationSchema } from "@/schemas/auth-schema.js";
import { User } from "@/models/user.js";
import {
  apiSuccess,
  apiConflict,
  handleApiError,
  createMethodHandler,
  createPostHandler,
} from "@/lib/api-utils";

// Business logic handler
const handleUserRegistration = async (validatedData) => {
  const { name, email, password } = validatedData;

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return NextResponse.json(
      apiConflict("User with this email already exists"),
      { status: 409 }
    );
  }

  // Create and save user
  const user = new User({
    name,
    email: email.toLowerCase(),
    password,
    role: "pending",
    status: "active",
    emailVerified: true,
    permissions: [],
  });

  await user.save();

  // Remove sensitive data
  const userResponse = user.toJSON();
  delete userResponse.password;
  delete userResponse.inviteToken;

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
  userRegistrationSchema,
  async (validatedData) => {
    try {
      return await handleUserRegistration(validatedData);
    } catch (error) {
      return NextResponse.json(
        handleApiError(error, "Failed to register user. Please try again."),
        { status: 500 }
      );
    }
  }
);

// Fallback for unsupported HTTP methods
export const { GET, PUT, DELETE } = createMethodHandler(["POST"]);
