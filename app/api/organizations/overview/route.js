import { Organization } from "@/models/organization";
import {
  getAuthenticatedUser,
  formatUserData,
  formatOrganizationData,
  createMethodHandler,
  createGetHandler,
  apiSuccess,
  notFound,
} from "@/lib/api";

/**
 * Handle organization overview request with comprehensive user and organization data
 */
const handleOrganizationOverview = async (queryParams, request) => {
  // Get authenticated user
  const user = await getAuthenticatedUser();

  // Super admin users have no organization
  if (user.role === "super_admin") {
    const userData = {
      user: formatUserData(user),
      organization: null,
      isOwner: false,
    };

    return apiSuccess("USER_OVERVIEW_RETRIEVED_SUCCESSFULLY", userData);
  }

  // Admin/staff users need organization data
  if (!user.organizationId) {
    return apiSuccess("NO_ORGANIZATION_OVERVIEW", {
      user: formatUserData(user),
      organization: null,
      isOwner: false,
    });
  }

  // Get organization with owner details
  const organization = await Organization.findById(user.organizationId)
    .populate("owner", "name email role status lastLogin createdAt")
    .select("-__v");

  if (!organization) {
    return notFound("ORGANIZATION_NOT_FOUND");
  }

  // Check if current user is the organization owner
  const isOwner = organization.owner._id.toString() === user._id.toString();

  // Clean overview response data
  const overviewData = {
    user: formatUserData(user),
    organization: formatOrganizationData(organization),
    isOwner,
  };

  return apiSuccess(
    "ORGANIZATION_OVERVIEW_RETRIEVED_SUCCESSFULLY",
    overviewData
  );
};

/**
 * GET /api/organizations/overview
 * Get comprehensive overview of the authenticated user and their organization
 * Returns user info, role, and organization details
 */
export const GET = createGetHandler(handleOrganizationOverview);

// Fallback for unsupported HTTP methods
export const { POST, PUT, DELETE } = createMethodHandler(["GET"]);
