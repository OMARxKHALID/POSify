import { logUpdate } from "@/lib/helpers/audit-helpers";
import {
  getAuthenticatedUser,
  hasRole,
  createMethodHandler,
  createGetHandler,
  createPostHandler,
  apiSuccess,
  forbidden,
  notFound,
  validateOrganizationExists,
  getOrCreateSettings,
  updateSettings,
  formatSettingsData,
  handleSettingsValidationError,
  createSettingsResponse,
} from "@/lib/api";
import { businessConfigSchema } from "@/schemas/settings-schema";

/**
 * Handle business settings data request with role-based access control
 */
const handleBusinessData = async (queryParams, request) => {
  try {
    const currentUser = await getAuthenticatedUser();

    // Admin and staff can access settings (staff need it for order creation)
    if (!hasRole(currentUser, ["admin", "staff"])) {
      return forbidden("INSUFFICIENT_PERMISSIONS");
    }

    // Validate organization exists
    const organization = await validateOrganizationExists(currentUser);
    if (!organization || organization.error) return organization;

    // Get or create settings
    const settings = await getOrCreateSettings(organization._id);

    const responseData = createSettingsResponse(
      settings,
      organization,
      currentUser
    );

    return apiSuccess("BUSINESS_SETTINGS_RETRIEVED_SUCCESSFULLY", responseData);
  } catch (error) {
    return handleSettingsValidationError(
      error,
      "BUSINESS_SETTINGS_RETRIEVAL_FAILED"
    );
  }
};

/**
 * Handle business settings update with role-based access control
 */
const handleBusinessUpdate = async (validatedData, request) => {
  try {
    const currentUser = await getAuthenticatedUser();

    // Admin and staff can update settings (staff need it for order creation)
    if (!hasRole(currentUser, ["admin", "staff"])) {
      return forbidden("INSUFFICIENT_PERMISSIONS");
    }

    // Validate organization exists
    const organization = await validateOrganizationExists(currentUser);
    if (!organization || organization.error) return organization;

    // Get original settings for audit log
    const originalSettings = await getOrCreateSettings(organization._id);

    // Update only business settings
    const updatedSettings = await updateSettings(organization._id, {
      business: validatedData,
    });

    // Log the update
    await logUpdate(
      "Settings",
      originalSettings,
      updatedSettings,
      currentUser,
      request
    );

    const responseData = createSettingsResponse(
      updatedSettings,
      organization,
      currentUser
    );

    return apiSuccess("BUSINESS_SETTINGS_UPDATED_SUCCESSFULLY", responseData);
  } catch (error) {
    return handleSettingsValidationError(
      error,
      "BUSINESS_SETTINGS_UPDATE_FAILED"
    );
  }
};

/**
 * GET /api/dashboard/settings/business
 * Get business settings
 */
export const GET = createGetHandler(handleBusinessData);

/**
 * POST /api/dashboard/settings/business
 * Update business settings
 */
export const POST = createPostHandler(
  businessConfigSchema,
  handleBusinessUpdate
);

export const { PUT, DELETE } = createMethodHandler(["GET", "POST"]);
