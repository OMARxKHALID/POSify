import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { getApiErrorMessages } from "@/lib/helpers/error-messages";

/**
 * Get error message for user operations
 */
const getUserErrorMessage = (error) => {
  return (
    getApiErrorMessages(error.code) ||
    (error.statusCode === 409 && getApiErrorMessages("USER_EXISTS")) ||
    (error.statusCode === 403 &&
      getApiErrorMessages("INSUFFICIENT_PERMISSIONS")) ||
    (error.statusCode === 404 && getApiErrorMessages("USER_NOT_FOUND")) ||
    error.message ||
    getApiErrorMessages("OPERATION_FAILED")
  );
};

/**
 * Hook to fetch users based on authenticated user's role and permissions
 */
export const useUsers = (options = {}) => {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
    retry = 2,
    ...queryOptions
  } = options;

  return useQuery({
    queryKey: ["users"],
    queryFn: () => apiClient.get("/dashboard/users"),
    enabled,
    staleTime,
    retry,
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
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User created successfully!");
    },
    onError: (error) => {
      console.error("User creation failed:", error);
      toast.error(getUserErrorMessage(error));
    },
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
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User updated successfully!");
    },
    onError: (error) => {
      console.error("User update failed:", error);
      toast.error(getUserErrorMessage(error));
    },
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
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted successfully!");
    },
    onError: (error) => {
      console.error("User deletion failed:", error);
      toast.error(getUserErrorMessage(error));
    },
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
