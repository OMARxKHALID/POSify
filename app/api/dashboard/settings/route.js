import { logCreate, logUpdate } from "@/lib/helpers/audit-helpers";
import {
  getAuthenticatedUser,
  hasRole,
  createMethodHandler,
  createGetHandler,
  createPutHandler,
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
import { settingsSchema } from "@/schemas/settings-schema";

/**
 * Handle settings data request with role-based access control
 */
const handleSettingsData = async (queryParams, request) => {
  try {
    const currentUser = await getAuthenticatedUser();

    // Only admin can access settings
    if (!hasRole(currentUser, ["admin"])) {
      return forbidden("INSUFFICIENT_PERMISSIONS");
    }

    // Validate organization exists
    const organization = await validateOrganizationExists(currentUser);
    if (!organization || organization.error) return organization;

    // Get or create settings
    const settings = await getOrCreateSettings(organization._id);

    // Log creation if it was a new settings document
    if (!settings.createdAt || settings.createdAt === settings.updatedAt) {
      await logCreate("Settings", settings, currentUser, request);
    }

    const responseData = createSettingsResponse(
      settings,
      organization,
      currentUser
    );

    return apiSuccess("SETTINGS_RETRIEVED_SUCCESSFULLY", responseData);
  } catch (error) {
    return handleSettingsValidationError(error, "SETTINGS_RETRIEVAL_FAILED");
  }
};

/**
 * Handle settings update with role-based access control
 */
const handleSettingsUpdate = async (validatedData, request) => {
  try {
    const currentUser = await getAuthenticatedUser();

    // Only admin can update settings
    if (!hasRole(currentUser, ["admin"])) {
      return forbidden("INSUFFICIENT_PERMISSIONS");
    }

    // Validate organization exists
    const organization = await validateOrganizationExists(currentUser);
    if (!organization || organization.error) return organization;

    // Get original settings for audit log
    const originalSettings = await getOrCreateSettings(organization._id);

    // Update settings
    const updatedSettings = await updateSettings(
      organization._id,
      validatedData
    );

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

    return apiSuccess("SETTINGS_UPDATED_SUCCESSFULLY", responseData);
  } catch (error) {
    return handleSettingsValidationError(error, "SETTINGS_UPDATE_FAILED");
  }
};

/**
 * GET /api/dashboard/settings
 * Get organization settings
 */
export const GET = createGetHandler(handleSettingsData);

/**
 * PUT /api/dashboard/settings
 * Update organization settings
 */
export const PUT = createPutHandler(handleSettingsUpdate, settingsSchema);

export const { POST, DELETE } = createMethodHandler(["GET", "PUT"]);
