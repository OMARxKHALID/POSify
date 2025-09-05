/**
 * useRegistration Hook
 * Comprehensive registration hook using TanStack React Query
 * Handles user registration, super admin registration, and organization registration
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

// Registration types
export const REGISTRATION_TYPES = {
  USER: "user",
  SUPER_ADMIN: "super_admin",
  ORGANIZATION: "organization",
};

/**
 * User Registration Hook
 * Registers a new user with pending role
 */
export function useUserRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData) => {
      // Send only the user input data - backend handles the rest
      const response = await apiClient.post("/register", userData);
      return response;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch user-related queries
      queryClient.invalidateQueries({ queryKey: ["users"] });

      toast.success(
        "User registered successfully! Please create an organization to complete setup."
      );
    },
    onError: (error) => {
      console.error("User registration failed:", error);

      // Handle specific error cases
      if (error.code === "USER_EXISTS") {
        toast.error("A user with this email already exists");
      } else if (error.statusCode === 409) {
        toast.error("User with this email already exists");
      } else {
        toast.error(
          error.message || "Failed to register user. Please try again."
        );
      }
    },
  });
}

/**
 * Super Admin Registration Hook
 * Registers a super admin user
 */
export function useSuperAdminRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (adminData) => {
      // Send only the user input data - backend handles the rest
      const response = await apiClient.post("/register/super-admin", adminData);
      return response;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch user-related queries
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["super-admin"] });

      toast.success("Super admin registered successfully!");
    },
    onError: (error) => {
      console.error("Super admin registration failed:", error);

      // Handle specific error cases
      if (error.code === "SUPER_ADMIN_EXISTS") {
        toast.error("Super admin already exists in the system");
      } else if (error.code === "USER_EXISTS") {
        toast.error("A user with this email already exists");
      } else if (error.statusCode === 409) {
        toast.error("User with this email already exists");
      } else {
        toast.error(
          error.message || "Failed to register super admin. Please try again."
        );
      }
    },
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
    onSuccess: (data, variables) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", variables.userId] });

      toast.success("Organization registered successfully!");
    },
    onError: (error) => {
      console.error("Organization registration failed:", error);

      // Handle specific error cases
      if (error.code === "USER_NOT_FOUND") {
        toast.error("User not found");
      } else if (error.code === "USER_SUSPENDED") {
        toast.error("User account is suspended");
      } else if (error.code === "USER_ALREADY_ORGANIZED") {
        toast.error("User already belongs to an organization");
      } else if (error.code === "ORGANIZATION_EXISTS") {
        toast.error("Organization with this name already exists");
      } else if (error.statusCode === 404) {
        toast.error("User not found");
      } else if (error.statusCode === 409) {
        toast.error("Organization with this name already exists");
      } else {
        toast.error(
          error.message || "Failed to register organization. Please try again."
        );
      }
    },
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

  const getMutation = () => {
    switch (type) {
      case REGISTRATION_TYPES.USER:
        return userRegistration;
      case REGISTRATION_TYPES.SUPER_ADMIN:
        return superAdminRegistration;
      case REGISTRATION_TYPES.ORGANIZATION:
        return organizationRegistration;
      default:
        return userRegistration;
    }
  };

  const mutation = getMutation();

  return {
    // Mutation state
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    data: mutation.data,

    // Reset function
    reset: mutation.reset,

    // Individual registration hooks
    userRegistration,
    superAdminRegistration,
    organizationRegistration,
  };
}

// Export registration types for convenience
export { REGISTRATION_TYPES };
