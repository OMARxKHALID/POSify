import { User } from "@/models/user";
import { Organization } from "@/models/organization";
import { userCreationSchema } from "@/schemas/auth-schema";
import { DEFAULT_PERMISSIONS } from "@/constants";
import { logCreate } from "@/lib/helpers/audit-helpers";
import {
  getAuthenticatedUser,
  hasRole,
  cleanUserResponse,
  createMethodHandler,
  createPostHandler,
} from "@/lib/api-utils";
import {
  apiSuccess,
  forbidden,
  conflict,
  notFound,
  badRequest,
  serverError,
} from "@/lib/api-utils";

/**
 * Handle user creation with admin permissions and organization validation
 */
const handleUserCreation = async (validatedData, request) => {
  const { name, email, password, role = "staff", permissions } = validatedData;
  const currentUser = await getAuthenticatedUser();

  if (!hasRole(currentUser, "admin")) {
    return forbidden("INSUFFICIENT_PERMISSIONS");
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return conflict("USER_EXISTS");
  }

  if (!currentUser.organizationId) {
    return notFound("ORGANIZATION_NOT_FOUND");
  }

  const organization = await Organization.findById(
    currentUser.organizationId
  ).select("-__v");
  if (!organization) {
    return notFound("ORGANIZATION_NOT_FOUND");
  }

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
