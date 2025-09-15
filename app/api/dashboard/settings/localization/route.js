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
import { z } from "zod";
import { DATE_FORMATS, TIME_FORMATS } from "@/constants";

const localizationSchema = z.object({
  currency: z.string().default("USD"),
  timezone: z.string().default("UTC"),
  language: z.string().default("en"),
  dateFormat: z.enum(DATE_FORMATS).default("MM/DD/YYYY"),
  timeFormat: z.enum(TIME_FORMATS).default("12h"),
});

/**
 * Handle localization settings data request with role-based access control
 */
const handleLocalizationData = async (queryParams, request) => {
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

    const responseData = createSettingsResponse(
      settings,
      organization,
      currentUser
    );

    return apiSuccess(
      "LOCALIZATION_SETTINGS_RETRIEVED_SUCCESSFULLY",
      responseData
    );
  } catch (error) {
    return handleSettingsValidationError(
      error,
      "LOCALIZATION_SETTINGS_RETRIEVAL_FAILED"
    );
  }
};

/**
 * Handle localization settings update with role-based access control
 */
const handleLocalizationUpdate = async (validatedData, request) => {
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

    // Update only localization settings
    const updatedSettings = await updateSettings(organization._id, {
      currency: validatedData.currency,
      timezone: validatedData.timezone,
      language: validatedData.language,
      dateFormat: validatedData.dateFormat,
      timeFormat: validatedData.timeFormat,
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

    return apiSuccess(
      "LOCALIZATION_SETTINGS_UPDATED_SUCCESSFULLY",
      responseData
    );
  } catch (error) {
    return handleSettingsValidationError(
      error,
      "LOCALIZATION_SETTINGS_UPDATE_FAILED"
    );
  }
};

/**
 * GET /api/dashboard/settings/localization
 * Get localization settings
 */
export const GET = createGetHandler(handleLocalizationData);

/**
 * POST /api/dashboard/settings/localization
 * Update localization settings
 */
export const POST = createPostHandler(
  handleLocalizationUpdate,
  localizationSchema
);

export const { PUT, DELETE } = createMethodHandler(["GET", "POST"]);
