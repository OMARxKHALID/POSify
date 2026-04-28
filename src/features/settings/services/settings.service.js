import { apiClient } from "@/lib/api-client";
import { settingsSchema } from "../schemas/settings.schema";
import { handleServiceError } from "@/lib/utils/error-handler";

const normalizeSettings = (sourceData) => {
  const { settings, organization, currentUser } = sourceData;
  const validatedSettings = settingsSchema.parse(settings || {});
  
  const organizationId = validatedSettings?.organizationId || organization?._id;
  const userRole = currentUser?.role;

  return {
    ...validatedSettings,
    organizationId,
    organizationName: organization?.name,
    organization,
    currentUser,
    userRole,
    userId: currentUser?._id,
    isAdmin: userRole === "admin",
    isStaff: userRole === "staff",
    isOwner: userRole === "admin" && organization?.owner === currentUser?._id,
    _raw: sourceData,
  };
};

export const settingsService = {
  getSettings: async () => {
    try {
      const response = await apiClient.get("/dashboard/settings");
      const normalized = normalizeSettings(response.data);
      
      if (!normalized.organizationId) {
        throw new Error("Organization ID not found in settings response");
      }

      return normalized;
    } catch (error) {
      handleServiceError(error);
    }
  },

  updateSettings: async (settingsData) => {
    try {
      const response = await apiClient.put("/dashboard/settings", settingsData);
      return settingsSchema.parse(response.data);
    } catch (error) {
      handleServiceError(error);
    }
  }
};
