import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDefaultMutationOptions,
  handleHookSuccess,
  invalidateQueries,
} from "@/lib/helpers/hook.helpers";
import { authService } from "../services/auth.service";

export const useRegister = (options = {}) => {
  return useMutation({
    mutationFn: (userData) => authService.register(userData),
    onSuccess: () => {
      handleHookSuccess("REGISTRATION_SUCCESSFUL");
    },
    ...getDefaultMutationOptions({ operation: "Registration" }),
    ...options,
  });
};

export const useRegisterSuperAdmin = (options = {}) => {
  return useMutation({
    mutationFn: (userData) => authService.registerSuperAdmin(userData),
    onSuccess: () => {
      handleHookSuccess("SUPER_ADMIN_REGISTRATION_SUCCESSFUL");
    },
    ...getDefaultMutationOptions({ operation: "Super admin registration" }),
    ...options,
  });
};

export const useRegisterOrganization = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orgData) => authService.registerOrganization(orgData),
    onSuccess: () => {
      invalidateQueries.organization(queryClient);
      handleHookSuccess("ORGANIZATION_REGISTRATION_SUCCESSFUL");
    },
    ...getDefaultMutationOptions({ operation: "Organization registration" }),
    ...options,
  });
};
