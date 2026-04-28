import { apiClient } from "@/lib/api-client";
import { userSchema } from "@/features/users/schemas/user.schema";
import { organizationSchema } from "@/features/organization/schemas/organization.schema";
import { handleServiceError } from "@/lib/utils/error-handler";

export const authService = {
  register: async (userData) => {
    try {
      const response = await apiClient.post("/register", userData);
      return userSchema.parse(response.data);
    } catch (error) {
      handleServiceError(error);
    }
  },

  registerSuperAdmin: async (userData) => {
    try {
      const response = await apiClient.post("/register/super-admin", userData);
      return userSchema.parse(response.data);
    } catch (error) {
      handleServiceError(error);
    }
  },

  registerOrganization: async (orgData) => {
    try {
      const response = await apiClient.post("/organizations/register", orgData);
      return organizationSchema.parse(response.data);
    } catch (error) {
      handleServiceError(error);
    }
  }
};
