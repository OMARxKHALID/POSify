import { userRegistrationSchema } from "@/schemas/auth-schema";
import { User } from "@/models/user";
import {
  cleanUserResponse,
  createMethodHandler,
  createPostHandler,
} from "@/lib/api-utils";
import { DEFAULT_PERMISSIONS } from "@/constants";
import { apiSuccess, conflict, serverError } from "@/lib/api-utils";

/**
 * Handle super admin registration with full system permissions
 */
const handleSuperAdminRegistration = async (validatedData) => {
  const { name, email, password } = validatedData;

  // Check for existing super admin
  const existingSuperAdmin = await User.findOne({ role: "super_admin" });
  if (existingSuperAdmin) {
    return conflict("SUPER_ADMIN_EXISTS");
  }

  // Check for existing user with same email
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return conflict("USER_EXISTS");
  }

  try {
    // Create new super admin with full permissions
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

    // Clean user response data
    const userResponse = cleanUserResponse(user);

    return apiSuccess("SUPER_ADMIN_REGISTERED_SUCCESSFULLY", userResponse, 201);
  } catch (error) {
    return serverError("REGISTRATION_FAILED");
  }
};

/**
 * POST /api/register/super-admin
 * Register a super admin user
 */
export const POST = createPostHandler(
  userRegistrationSchema,
  handleSuperAdminRegistration
);

// Fallback for unsupported HTTP methods
export const { GET, PUT, DELETE } = createMethodHandler(["POST"]);
