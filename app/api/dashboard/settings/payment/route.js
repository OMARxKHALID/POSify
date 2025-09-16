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
import { paymentSettingsSchema } from "@/schemas/settings-schema";

/**
 * Handle payment settings data request with role-based access control
 */
const handlePaymentData = async (queryParams, request) => {
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

    return apiSuccess("PAYMENT_SETTINGS_RETRIEVED_SUCCESSFULLY", responseData);
  } catch (error) {
    return handleSettingsValidationError(
      error,
      "PAYMENT_SETTINGS_RETRIEVAL_FAILED"
    );
  }
};

/**
 * Handle payment settings update with role-based access control
 */
const handlePaymentUpdate = async (validatedData, request) => {
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

    // Update only payment settings
    const updatedSettings = await updateSettings(organization._id, {
      payment: validatedData,
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

    return apiSuccess("PAYMENT_SETTINGS_UPDATED_SUCCESSFULLY", responseData);
  } catch (error) {
    return handleSettingsValidationError(
      error,
      "PAYMENT_SETTINGS_UPDATE_FAILED"
    );
  }
};

/**
 * GET /api/dashboard/settings/payment
 * Get payment settings
 */
export const GET = createGetHandler(handlePaymentData);

/**
 * POST /api/dashboard/settings/payment
 * Update payment settings
 */
export const POST = createPostHandler(
  paymentSettingsSchema,
  handlePaymentUpdate
);

export const { PUT, DELETE } = createMethodHandler(["GET", "POST"]);
