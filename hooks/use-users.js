/**
 * useUsers Hook
 * Custom hook for user management operations using TanStack React Query
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import {
  getDefaultQueryOptions,
  getDefaultMutationOptions,
  handleHookSuccess,
  queryKeys,
  invalidateQueries,
} from "@/lib/hooks/hook-utils";

/**
 * Hook to fetch users based on authenticated user's role and permissions
 */
export const useUsers = (options = {}) => {
  const queryOptions = getDefaultQueryOptions({
    staleTime: 3 * 60 * 1000, // 3 minutes (users data changes moderately)
    ...options,
  });

  return useQuery({
    queryKey: queryKeys.users,
    queryFn: async () => {
      const data = await apiClient.get("/dashboard/users");
      return data;
    },
    ...queryOptions,
  });
};

/**
 * User Creation Hook
 * Creates a new user (admin/super_admin only)
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData) => {
      const response = await apiClient.post(
        "/dashboard/users/create",
        userData
      );
      return response;
    },
    onSuccess: () => {
      invalidateQueries.users(queryClient);
      handleHookSuccess("USER_CREATED_SUCCESSFULLY");
    },
    ...getDefaultMutationOptions({ operation: "User creation" }),
  });
};

/**
 * User Edit Hook
 * Edits/updates an existing user
 */
export const useEditUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, userData }) => {
      const response = await apiClient.put(
        `/dashboard/users/edit?userId=${userId}`,
        userData
      );
      return response;
    },
    onSuccess: () => {
      invalidateQueries.users(queryClient);
      handleHookSuccess("USER_UPDATED_SUCCESSFULLY");
    },
    ...getDefaultMutationOptions({ operation: "User update" }),
  });
};

/**
 * User Delete Hook
 * Deletes a user
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId) => {
      const response = await apiClient.delete(
        `/dashboard/users/delete?userId=${userId}`
      );
      return response;
    },
    onSuccess: () => {
      invalidateQueries.users(queryClient);
      handleHookSuccess("USER_DELETED_SUCCESSFULLY");
    },
    ...getDefaultMutationOptions({ operation: "User deletion" }),
  });
};

/**
 * Main Users Management Hook
 * Provides a unified interface for all user management operations
 */
export const useUsersManagement = () => {
  const usersQuery = useUsers();
  const createUserMutation = useCreateUser();
  const editUserMutation = useEditUser();
  const deleteUserMutation = useDeleteUser();

  return {
    ...usersQuery,
    createUser: createUserMutation,
    editUser: editUserMutation,
    deleteUser: deleteUserMutation,
  };
};
