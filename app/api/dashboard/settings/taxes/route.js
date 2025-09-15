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
import { taxSettingsSchema } from "@/schemas/settings-schema";
import { z } from "zod";

const taxesUpdateSchema = z.object({
  taxes: z.array(taxSettingsSchema),
});

/**
 * Handle taxes data request with role-based access control
 */
const handleTaxesData = async (queryParams, request) => {
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

    return apiSuccess("TAXES_RETRIEVED_SUCCESSFULLY", responseData);
  } catch (error) {
    return handleSettingsValidationError(error, "TAXES_RETRIEVAL_FAILED");
  }
};

/**
 * Handle taxes update with role-based access control
 */
const handleTaxesUpdate = async (validatedData, request) => {
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

    // Update only taxes
    const updatedSettings = await updateSettings(organization._id, {
      taxes: validatedData.taxes,
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

    return apiSuccess("TAXES_UPDATED_SUCCESSFULLY", responseData);
  } catch (error) {
    return handleSettingsValidationError(error, "TAXES_UPDATE_FAILED");
  }
};

/**
 * GET /api/dashboard/settings/taxes
 * Get tax settings
 */
export const GET = createGetHandler(handleTaxesData);

/**
 * POST /api/dashboard/settings/taxes
 * Update tax settings
 */
export const POST = createPostHandler(handleTaxesUpdate, taxesUpdateSchema);

export const { PUT, DELETE } = createMethodHandler(["GET", "POST"]);
