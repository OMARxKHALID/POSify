import { NextResponse } from "next/server";
import { userRegistrationSchema } from "@/schemas/auth-schema";
import { User } from "@/models/user";
import { getApiErrorMessages } from "@/lib/helpers/error-messages";
import {
  apiSuccess,
  apiConflict,
  handleApiError,
  createMethodHandler,
  createPostHandler,
} from "@/lib/api-utils";

/**
 * Business logic handler for user registration
 * Creates a new user with pending role
 */
const handleUserRegistration = async (validatedData) => {
  const { name, email, password } = validatedData;

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new Error("USER_EXISTS");
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

/**
 * POST /api/register
 * Register a new user (without organization)
 */
export const POST = createPostHandler(
  userRegistrationSchema,
  async (validatedData) => {
    try {
      return await handleUserRegistration(validatedData);
    } catch (error) {
      // Handle specific errors
      if (error.message === "USER_EXISTS") {
        return NextResponse.json(
          apiConflict(getApiErrorMessages("USER_EXISTS")),
          { status: 409 }
        );
      }

      // Handle other errors
      return NextResponse.json(
        handleApiError(error, getApiErrorMessages("REGISTRATION_FAILED")),
        { status: 500 }
      );
    }
  }
);

// Fallback for unsupported HTTP methods
export const { GET, PUT, DELETE } = createMethodHandler(["POST"]);
