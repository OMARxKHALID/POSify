import { apiClient } from "@/lib/api-client";
import { userSchema } from "../schemas/user.schema";
import { z } from "zod";

export const userService = {
  getUsers: async () => {
    const response = await apiClient.get("/dashboard/users");
    const users = response.data?.users || [];
    const validatedUsers = z.array(userSchema).parse(users);
    return {
      ...response.data,
      users: validatedUsers
    };
  },

  createUser: async (userData) => {
    const response = await apiClient.post("/dashboard/users/create", userData);
    return userSchema.parse(response.data);
  },

  updateUser: async (userId, userData) => {
    const response = await apiClient.put(`/dashboard/users/edit?userId=${userId}`, userData);
    return userSchema.parse(response.data);
  },

  deleteUser: async (userId) => {
    const response = await apiClient.delete(`/dashboard/users/delete?userId=${userId}`);
    return userSchema.parse(response.data);
  }
};
