import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppContext } from "@/lib/hooks/use-app-context";
import {
  getDefaultQueryOptions,
  getDefaultMutationOptions,
  handleHookSuccess,
  queryKeys,
  invalidateQueries,
  createServiceQueryFn,
} from "@/lib/helpers/hook.helpers";
import { mockFallback } from "@/lib/mockup-data";
import { userService } from "../services/user.service";

export const useUsers = (options = {}) => {
  const { userId, isDemoMode } = useAppContext();

  return useQuery({
    queryKey: queryKeys.users(userId),
    queryFn: createServiceQueryFn(
      userService.getUsers,
      () => mockFallback.users(),
      isDemoMode,
    ),
    ...getDefaultQueryOptions(options),
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
