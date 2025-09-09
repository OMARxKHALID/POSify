/**
 * useRegistration Hook
 * Comprehensive registration hook using TanStack React Query
 * Handles user registration, super admin registration, and organization registration
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import {
  getDefaultMutationOptions,
  handleHookSuccess,
  invalidateQueries,
} from "@/lib/hooks/hook-utils";
import { REGISTRATION_TYPES } from "@/constants";

/**
 * User Registration Hook
 * Registers a new user with pending role
 */
export function useUserRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData) => {
      const response = await apiClient.post("/register", userData);
      return response;
    },
    onSuccess: async (data, variables) => {
      invalidateQueries.users(queryClient);
      handleHookSuccess(
        "User registered successfully. Please create an organization to complete setup."
      );
    },
    ...getDefaultMutationOptions({ operation: "User registration" }),
  });
}

/**
 * Super Admin Registration Hook
 * Registers a super admin user with full system permissions
 */
export function useSuperAdminRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData) => {
      const response = await apiClient.post("/register/super-admin", userData);
      return response;
    },
    onSuccess: async (data, variables) => {
      invalidateQueries.users(queryClient);
      handleHookSuccess("Super admin registered successfully");
    },
    ...getDefaultMutationOptions({ operation: "Super admin registration" }),
  });
}

/**
 * Organization Registration Hook
 * Registers a new organization and links it to an existing user
 */
export function useOrganizationRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orgData) => {
      const response = await apiClient.post("/organizations/register", orgData);
      return response;
    },
    onSuccess: async (data, variables) => {
      // Invalidate queries
      invalidateQueries.organizations(queryClient);
      invalidateQueries.users(queryClient);
      invalidateQueries.user(queryClient, variables.userId);

      // Show success toast
      handleHookSuccess(
        "Organization created successfully! Welcome to your dashboard."
      );
    },
    ...getDefaultMutationOptions({ operation: "Organization registration" }),
  });
}

/**
 * Main Registration Hook
 * Unified hook that handles all registration types
 */
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
