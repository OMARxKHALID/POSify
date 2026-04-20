import { apiClient } from "@/lib/api-client";
import { userSchema } from "@/features/users/schemas/user.schema";
import { organizationSchema } from "@/features/organization/schemas/organization.schema";

export const authService = {
  register: async (userData) => {
    const response = await apiClient.post("/register", userData);
    return userSchema.parse(response.data);
  },

  registerSuperAdmin: async (userData) => {
    const response = await apiClient.post("/register/super-admin", userData);
    return userSchema.parse(response.data);
  },

  registerOrganization: async (orgData) => {
    const response = await apiClient.post("/organizations/register", orgData);
    return organizationSchema.parse(response.data);
  }
};
