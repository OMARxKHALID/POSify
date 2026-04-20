import { apiClient } from "@/lib/api-client";
import { organizationSchema } from "../schemas/organization.schema";
import { userSchema } from "@/features/users/schemas/user.schema";
import { z } from "zod";

export const organizationService = {
  getOverview: async () => {
    const response = await apiClient.get("/organizations/overview");
    return organizationSchema.parse(response.data);
  },

  getAvailableStaff: async (organizationId) => {
    const response = await apiClient.get(`/dashboard/organizations/available-staff?organizationId=${organizationId}`);
    const users = response.data?.users || [];
    const validatedUsers = z.array(userSchema).parse(users);
    return {
      ...response.data,
      users: validatedUsers
    };
  },

  transferOwnership: async (organizationId, newOwnerId) => {
    const response = await apiClient.post("/dashboard/organizations/transfer-ownership", {
      organizationId,
      newOwnerId,
    });
    return organizationSchema.parse(response.data);
  }
};
