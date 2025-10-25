/**
 * Settings API utility functions
 * Centralized utilities for settings-related API operations
 */

import { Settings } from "@/models/settings";
import { badRequest, serverError } from "./response-utils";
import {
  ORDER_STATUSES,
  RECEIPT_TEMPLATES,
  SERVICE_CHARGE_APPLY_ON,
  DEFAULT_RECEIPT_FOOTER,
  DEFAULT_SUGGESTED_TIP_PERCENTAGES,
  TAX_TYPES,
} from "@/constants";

/**
 * Format settings data for API response
 */
const safeEnum = (value, allowed, fallback) =>
  allowed?.includes?.(value) ? value : fallback;

export const formatSettingsData = (settings) => {
  const receipt = {
    template: safeEnum(settings?.receipt?.template, RECEIPT_TEMPLATES, "default"),
    footer: settings?.receipt?.footer ?? DEFAULT_RECEIPT_FOOTER,
    header: settings?.receipt?.header ?? "",
    printLogo: settings?.receipt?.printLogo ?? true,
    showTaxBreakdown: settings?.receipt?.showTaxBreakdown ?? true,
    showItemDiscounts: settings?.receipt?.showItemDiscounts ?? true,
    showOrderNumber: settings?.receipt?.showOrderNumber ?? true,
    showServerName: settings?.receipt?.showServerName ?? true,
    autoPrint: settings?.receipt?.autoPrint ?? false,
  };

  const operational = {
    orderManagement: {
      defaultStatus: safeEnum(
        settings?.operational?.orderManagement?.defaultStatus,
        ORDER_STATUSES,
        "pending"
      ),
    },
  };

  const business = {
    serviceCharge: {
      enabled: settings?.business?.serviceCharge?.enabled ?? false,
      percentage: settings?.business?.serviceCharge?.percentage ?? 0,
      applyOn: safeEnum(
        settings?.business?.serviceCharge?.applyOn,
        SERVICE_CHARGE_APPLY_ON,
        "subtotal"
      ),
    },
    tipping: {
      enabled: settings?.business?.tipping?.enabled ?? true,
      suggestedPercentages:
        settings?.business?.tipping?.suggestedPercentages ??
        DEFAULT_SUGGESTED_TIP_PERCENTAGES,
      allowCustomTip: settings?.business?.tipping?.allowCustomTip ?? true,
    },
  };

  const taxes = Array.isArray(settings?.taxes)
    ? settings.taxes.map((t) => ({
        id: t.id,
        name: t.name,
        rate: typeof t.rate === "number" ? t.rate : Number(t.rate) || 0,
        enabled: t.enabled ?? true,
        type: safeEnum(t.type, TAX_TYPES, "percentage"),
      }))
    : [];

  return {
    id: settings._id,
    organizationId: settings.organizationId,
    taxes,
    receipt,
    operational,
    business,
    currency: settings?.currency || "USD",
    createdAt: settings.createdAt,
    updatedAt: settings.updatedAt,
  };
};

/**
 * Get or create settings for organization
 */
export const getOrCreateSettings = async (organizationId) => {
  let settings = await Settings.findOne({
    organizationId,
  }).lean();

  // If no settings exist, create default settings
  if (!settings) {
    const newSettings = new Settings({
      organizationId,
      taxes: [],
      receipt: {},
      operational: {},
      business: {},
      currency: "USD",
    });

    await newSettings.save();
    settings = newSettings.toObject();
  }

  return settings;
};

/**
 * Update settings with validation
 */
export const updateSettings = async (organizationId, updateData) => {
  const flattenObject = (obj, parentKey = '', result = {}) => {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const newKey = parentKey ? `${parentKey}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          flattenObject(obj[key], newKey, result);
        } else {
          result[newKey] = obj[key];
        }
      }
    }
    return result;
  };

  const updatePayload = flattenObject(updateData);
  updatePayload.updatedAt = new Date();

  return await Settings.findOneAndUpdate(
    { organizationId },
    { $set: updatePayload },
    { new: true, runValidators: true }
  );
};

/**
 * Handle settings validation errors
 */
export const handleSettingsValidationError = (
  error,
  defaultMessage = "SETTINGS_OPERATION_FAILED"
) => {
  if (error.name === "ValidationError") {
    const validationErrors = Object.values(error.errors).map(
      (err) => err.message
    );
    return badRequest(`VALIDATION_ERROR: ${validationErrors.join(", ")}`);
  }

  if (error.code === 11000) {
    return badRequest("DUPLICATE_SETTINGS");
  }

  return serverError(defaultMessage);
};

/**
 * Create standard settings response
 */
export const createSettingsResponse = (
  settings,
  organization,
  currentUser,
  message
) => {
  return {
    settings: formatSettingsData(settings),
    organization: { id: organization._id, name: organization.name },
    currentUser: {
      id: currentUser._id,
      role: currentUser.role,
      organizationId: currentUser.organizationId,
    },
  };
};
