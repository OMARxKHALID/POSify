import { User } from "@/models/user";
import {
  getAuthenticatedUser,
  formatUserData,
  createMethodHandler,
  createGetHandler,
  apiSuccess,
  forbidden,
  validateOrganizationExists,
} from "@/lib/api";

/**
 * Handle users data request with role-based access control
 */
const handleUsersData = async (queryParams, request) => {
  const currentUser = await getAuthenticatedUser();

  let users = [];
  let organizationData = null;

  switch (currentUser.role) {
    case "super_admin":
      users = await User.find({})
        .populate("organizationId", "name")
        .select("-password -inviteToken -__v")
        .sort({ createdAt: -1 });
      break;

    case "admin":
      const organization = await validateOrganizationExists(currentUser);
      if (!organization || organization.error) return organization;

      organizationData = { id: organization._id, name: organization.name };
      users = await User.find({ organizationId: currentUser.organizationId })
        .select("-password -inviteToken -__v")
        .sort({ createdAt: -1 });
      break;

    case "staff":
      users = [currentUser];
      break;

    default:
      return forbidden("INSUFFICIENT_PERMISSIONS");
  }

  const formattedUsers = users.map(formatUserData);

  return apiSuccess("USERS_RETRIEVED_SUCCESSFULLY", {
    users: formattedUsers,
    organization: organizationData,
    currentUser: formatUserData(currentUser),
  });
};

/**
 * GET /api/dashboard/users
 * Get users based on authenticated user's role and permissions
 */
export const GET = createGetHandler(handleUsersData);

// Fallback for unsupported HTTP methods
export const { POST, PUT, DELETE } = createMethodHandler(["GET"]);
