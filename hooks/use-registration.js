import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import {
  getDefaultQueryOptions,
  getDefaultMutationOptions,
  handleHookSuccess,
  queryKeys,
  invalidateQueries,
} from "@/lib/helpers/hook-helpers";
import { useIsDemoModeEnabled } from "@/hooks/use-demo-mode";
import { REGISTRATION_TYPES } from "@/constants";


export function useUserRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData) => {
      const response = await apiClient.post("/register", userData);
      return response;
    },
    onSuccess: async (data, variables) => {
      invalidateQueries.users(queryClient);
      handleHookSuccess("USER_REGISTERED_SUCCESSFULLY");
    },
    ...getDefaultMutationOptions({ operation: "User registration" }),
  });
}


export function useSuperAdminRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData) => {
      const response = await apiClient.post("/register/super-admin", userData);
      return response;
    },
    onSuccess: async (data, variables) => {
      invalidateQueries.users(queryClient);
      handleHookSuccess("SUPER_ADMIN_REGISTERED_SUCCESSFULLY");
    },
    ...getDefaultMutationOptions({ operation: "Super admin registration" }),
  });
}


export function useOrganizationRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orgData) => {
      const response = await apiClient.post("/organizations/register", orgData);
      return response;
    },
    onSuccess: async (data, variables) => {

      invalidateQueries.organizations(queryClient);
      invalidateQueries.users(queryClient);
      invalidateQueries.user(queryClient, variables.userId);


      handleHookSuccess("ORGANIZATION_REGISTERED_SUCCESSFULLY");
    },
    ...getDefaultMutationOptions({ operation: "Organization registration" }),
  });
}


export function useRegistration(type = REGISTRATION_TYPES.USER) {
  const userRegistration = useUserRegistration();
  const superAdminRegistration = useSuperAdminRegistration();
  const organizationRegistration = useOrganizationRegistration();

  switch (type) {
    case REGISTRATION_TYPES.SUPER_ADMIN:
      return superAdminRegistration;
    case REGISTRATION_TYPES.ORGANIZATION:
      return organizationRegistration;
    case REGISTRATION_TYPES.USER:
    default:
      return userRegistration;
  }
}
