import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/lib/mock-auth";
import { apiClient } from "@/lib/api-client";
import {
  getDefaultQueryOptions,
  getDefaultMutationOptions,
  handleHookSuccess,
  queryKeys,
  invalidateQueries,
  createDemoQueryFn,
} from "@/lib/helpers/hook.helpers";
import { useIsDemoModeEnabled } from "@/features/settings/hooks/use-demo-mode";
import { mockFallback } from "@/lib/mockup-data";

export const useUsers = (options = {}) => {
  const { data: session } = useSession();
  const isDemoMode = useIsDemoModeEnabled();

  return useQuery({
    queryKey: [...queryKeys.users(), session?.user?.id],
    queryFn: createDemoQueryFn(
      "/dashboard/users",
      () => mockFallback.users().data,
      isDemoMode,
    ),
    ...getDefaultQueryOptions({
      staleTime: 3 * 60 * 1000,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      ...options,
    }),
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData) => {
      const response = await apiClient.post(
        "/dashboard/users/create",
        userData,
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

export const useEditUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, userData }) => {
      const response = await apiClient.put(
        `/dashboard/users/edit?userId=${userId}`,
        userData,
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

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId) => {
      const response = await apiClient.delete(
        `/dashboard/users/delete?userId=${userId}`,
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
