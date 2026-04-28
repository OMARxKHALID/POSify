import { apiClient } from "@/lib/api-client";
import { settingsSchema } from "../schemas/settings.schema";
import { organizationSchema } from "@/features/organization/schemas/organization.schema";
import { userSchema } from "@/features/users/schemas/user.schema";
import { handleServiceError } from "@/lib/utils/error-handler";

const normalizeSettings = (sourceData) => {
  const { settings, organization, currentUser } = sourceData;
  const validatedSettings = settingsSchema.parse(settings || {});
  
  const validatedOrganization = organization ? organizationSchema.safeParse(organization).data : undefined;
  const validatedUser = currentUser ? userSchema.safeParse(currentUser).data : undefined;

  const organizationId = validatedSettings?.organizationId || validatedOrganization?._id;
  const userRole = validatedUser?.role;

  return {
    ...validatedSettings,
    organizationId,
    organizationName: validatedOrganization?.name,
    organization: validatedOrganization,
    currentUser: validatedUser,
    userRole,
    userId: validatedUser?._id,
    isAdmin: userRole === "admin",
    isStaff: userRole === "staff",
    isOwner: userRole === "admin" && validatedOrganization?.owner === validatedUser?._id,
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
