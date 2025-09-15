/**
 * Settings API utility functions
 * Centralized utilities for settings-related API operations
 */

import { Settings } from "@/models/settings";
import { badRequest, serverError } from "./response-utils";

/**
 * Format settings data for API response
 */
export const formatSettingsData = (settings) => ({
  id: settings._id,
  organizationId: settings.organizationId,
  taxes: settings.taxes || [],
  payment: settings.payment || {},
  receipt: settings.receipt || {},
  customerPreferences: settings.customerPreferences || {},
  operational: settings.operational || {},
  business: settings.business || {},
  currency: settings.currency || "USD",
  timezone: settings.timezone || "UTC",
  language: settings.language || "en",
  dateFormat: settings.dateFormat || "MM/DD/YYYY",
  timeFormat: settings.timeFormat || "12h",
  createdAt: settings.createdAt,
  updatedAt: settings.updatedAt,
});

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
      payment: {},
      receipt: {},
      customerPreferences: {},
      operational: {},
      business: {},
      currency: "USD",
      timezone: "UTC",
      language: "en",
      dateFormat: "MM/DD/YYYY",
      timeFormat: "12h",
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
  return await Settings.findOneAndUpdate(
    { organizationId },
    {
      ...updateData,
      updatedAt: new Date(),
    },
    { new: true, runValidators: true, upsert: true }
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
