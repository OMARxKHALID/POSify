import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/lib/mock-auth";
import {
  getDefaultQueryOptions,
  getDefaultMutationOptions,
  handleHookSuccess,
  queryKeys,
  invalidateQueries,
  createServiceQueryFn,
} from "@/lib/helpers/hook.helpers";
import { useIsDemoModeEnabled } from "@/features/settings/hooks/use-demo-mode";
import { mockFallback } from "@/lib/mockup-data";
import { userService } from "../services/user.service";

export const useUsers = (options = {}) => {
  const { data: session } = useSession();
  const isDemoMode = useIsDemoModeEnabled();

  return useQuery({
    queryKey: [...queryKeys.users(), session?.user?.id],
    queryFn: createServiceQueryFn(
      userService.getUsers,
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
    mutationFn: (userData) => userService.createUser(userData),
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
    mutationFn: ({ userId, userData }) => userService.updateUser(userId, userData),
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
    mutationFn: (userId) => userService.deleteUser(userId),
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
