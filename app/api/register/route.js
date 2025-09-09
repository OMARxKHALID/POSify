import { userRegistrationSchema } from "@/schemas/auth-schema";
import { User } from "@/models/user";
import {
  cleanUserResponse,
  createMethodHandler,
  createPostHandler,
} from "@/lib/api-utils";
import { apiSuccess, conflict, serverError } from "@/lib/api-utils";

/**
 * Handle user registration with pending role
 */
const handleUserRegistration = async (validatedData) => {
  const { name, email, password } = validatedData;

  // Check for existing user with same email
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return conflict("USER_EXISTS");
  }

  try {
    // Create new user with pending role
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

    // Clean user response data
    const userResponse = cleanUserResponse(user);

    return apiSuccess("USER_REGISTERED_SUCCESSFULLY", userResponse, 201);
  } catch (error) {
    return serverError("REGISTRATION_FAILED");
  }
};

/**
 * POST /api/register
 * Register a new user (without organization)
 */
export const POST = createPostHandler(
  userRegistrationSchema,
  handleUserRegistration
);

// Fallback for unsupported HTTP methods
export const { GET, PUT, DELETE } = createMethodHandler(["POST"]);
