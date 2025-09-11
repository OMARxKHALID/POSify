import { User } from "@/models/user";
import { userCreationSchema } from "@/schemas/auth-schema";
import { DEFAULT_PERMISSIONS } from "@/constants";
import { logCreate } from "@/lib/helpers/audit-helpers";
import {
  getAuthenticatedUser,
  hasRole,
  cleanUserResponse,
  createMethodHandler,
  createPostHandler,
  apiSuccess,
  forbidden,
  badRequest,
  serverError,
  checkUserExists,
  validateOrganizationExists,
} from "@/lib/api";

/**
 * Handle user creation with admin permissions and organization validation
 */
const handleUserCreation = async (validatedData, request) => {
  const { name, email, password, role = "staff", permissions } = validatedData;
  const currentUser = await getAuthenticatedUser();

  if (!hasRole(currentUser, "admin")) {
    return forbidden("INSUFFICIENT_PERMISSIONS");
  }

  const userExistsError = await checkUserExists(email);
  if (userExistsError) return userExistsError;

  const organization = await validateOrganizationExists(currentUser);
  if (!organization || organization.error) return organization;

  if (role !== "staff") {
    return badRequest("INVALID_ROLE_FOR_ADMIN");
  }

  try {
    const defaultPermissions = DEFAULT_PERMISSIONS[role] || [];
    const finalPermissions =
      permissions && permissions.length > 0
        ? permissions.filter((perm) => defaultPermissions.includes(perm))
        : defaultPermissions;

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password,
      role,
      status: "active",
      emailVerified: true,
      permissions: finalPermissions,
      organizationId: currentUser.organizationId,
      createdBy: currentUser._id,
    });

    await newUser.save();
    await logCreate("User", newUser, currentUser, request);

    const userResponse = cleanUserResponse(newUser);
    return apiSuccess("USER_CREATED_SUCCESSFULLY", userResponse, 201);
  } catch (error) {
    return serverError("USER_CREATION_FAILED");
  }
};

/**
 * POST /api/dashboard/users/create
 * Create a new user (admin/super_admin only)
 */
export const POST = createPostHandler(userCreationSchema, handleUserCreation);

// Fallback for unsupported HTTP methods
export const { GET, PUT, DELETE } = createMethodHandler(["POST"]);
