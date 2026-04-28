import { apiClient } from "@/lib/api-client";
import { userSchema } from "../schemas/user.schema";
import { organizationSchema } from "@/features/organization/schemas/organization.schema";
import { z } from "zod";
import { handleServiceError } from "@/lib/utils/error-handler";

export const userService = {
  getUsers: async () => {
    try {
      const response = await apiClient.get("/dashboard/users");
      const users = response.data?.users || [];
      const validatedUsers = z.array(userSchema).parse(users);
      return {
        users: validatedUsers,
        ...(response.data?.currentUser && { currentUser: userSchema.safeParse(response.data.currentUser).data }),
        ...(response.data?.organization && { organization: organizationSchema.safeParse(response.data.organization).data }),
      };
    } catch (error) {
      handleServiceError(error);
    }
  },

  createUser: async (userData) => {
    try {
      const response = await apiClient.post("/dashboard/users/create", userData);
      return userSchema.parse(response.data);
    } catch (error) {
      handleServiceError(error);
    }
  },

  updateUser: async (userId, userData) => {
    try {
      const response = await apiClient.put(`/dashboard/users/edit?userId=${userId}`, userData);
      return userSchema.parse(response.data);
    } catch (error) {
      handleServiceError(error);
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await apiClient.delete(`/dashboard/users/delete?userId=${userId}`);
      return userSchema.parse(response.data);
    } catch (error) {
      handleServiceError(error);
    }
  }
};
