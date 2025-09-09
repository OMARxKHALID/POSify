import { Organization } from "@/models/organization";
import {
  getAuthenticatedUser,
  formatUserData,
  formatOrganizationData,
  createMethodHandler,
  createGetHandler,
} from "@/lib/api-utils";
import { apiSuccess, notFound } from "@/lib/api-utils";

/**
 * Handle organization data request for authenticated user
 */
const handleOrganizationData = async (queryParams, request) => {
  // Get authenticated user with organization data
  const user = await getAuthenticatedUser();

  // Populate organization data if available
  if (user.organizationId) {
    await user.populate({
      path: "organizationId",
      select: "-__v",
    });
  }

  if (!user.organizationId) {
    return apiSuccess("NO_ORGANIZATION_FOUND", null);
  }

  // Get organization with owner details
  const organization = await Organization.findById(user.organizationId._id)
    .populate("owner", "name email role")
    .select("-__v");

  if (!organization) {
    return notFound("ORGANIZATION_NOT_FOUND");
  }

  // Clean organization response data
  const organizationData = {
    ...formatOrganizationData(organization),
    user: formatUserData(user),
  };

  return apiSuccess(
    "ORGANIZATION_DATA_RETRIEVED_SUCCESSFULLY",
    organizationData
  );
};

/**
 * GET /api/organizations
 * Fetch organization data for the authenticated user
 */
export const GET = createGetHandler(handleOrganizationData);

// Fallback for unsupported HTTP methods
export const { POST, PUT, DELETE } = createMethodHandler(["GET"]);
