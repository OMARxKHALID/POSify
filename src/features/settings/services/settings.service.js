import { apiClient } from "@/lib/api-client";
import { settingsSchema } from "../schemas/settings.schema";

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
    const response = await apiClient.get("/dashboard/settings");
    const normalized = normalizeSettings(response.data);
    
    if (!normalized.organizationId) {
      throw new Error("Organization ID not found in settings response");
    }

    return normalized;
  },

  updateSettings: async (settingsData) => {
    const response = await apiClient.put("/dashboard/settings", settingsData);
    return settingsSchema.parse(response.data);
  }
};
