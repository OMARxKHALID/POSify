import { User } from "@/models/user";
import { Organization } from "@/models/organization";
import {
  getAuthenticatedUser,
  hasRole,
  formatUserData,
  createMethodHandler,
  createGetHandler,
} from "@/lib/api-utils";
import { apiSuccess, notFound, forbidden } from "@/lib/api-utils";

/**
 * Handle getting available staff members for ownership transfer
 */
const handleAvailableStaff = async (queryParams, request) => {
  const { organizationId } = queryParams;
  const currentUser = await getAuthenticatedUser();

  // Only super_admin can view available staff for transfer
  if (!hasRole(currentUser, "super_admin")) {
    return forbidden("INSUFFICIENT_PERMISSIONS");
  }

  // Validate organization exists
  const organization = await Organization.findById(organizationId)
    .populate("owner", "name email role")
    .select("name owner");
  if (!organization) {
    return notFound("ORGANIZATION_NOT_FOUND");
  }

  // Get all staff members in the organization
  const staffMembers = await User.find({
    organizationId: organizationId,
    role: "staff",
  })
    .select("-password -inviteToken -__v")
    .sort({ name: 1 });

  const formattedStaff = staffMembers.map(formatUserData);

  return apiSuccess("AVAILABLE_STAFF_RETRIEVED_SUCCESSFULLY", {
    organization: {
      id: organization._id,
      name: organization.name,
      currentOwner: formatUserData(organization.owner),
    },
    availableStaff: formattedStaff,
    staffCount: formattedStaff.length,
  });
};

/**
 * GET /api/dashboard/organizations/available-staff?organizationId=<id>
 * Get all staff members available for ownership transfer
 */
export const GET = createGetHandler(handleAvailableStaff);

// Fallback for unsupported HTTP methods
export const { POST, PUT, DELETE } = createMethodHandler(["GET"]);
