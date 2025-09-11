/**
 * useOrganization Hook
 * Custom hook for fetching organization data and managing ownership transfers using TanStack React Query
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import {
  getDefaultQueryOptions,
  getDefaultMutationOptions,
  queryKeys,
  invalidateQueries,
} from "@/lib/hooks/hook-utils";

/**
 * Hook to fetch organization overview data
 */
export const useOrganizationOverview = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.organization,
    queryFn: async () => {
      const data = await apiClient.get("/organizations/overview");
      return data;
    },
    ...getDefaultQueryOptions({
      staleTime: 5 * 60 * 1000, // 5 minutes (organization data changes less frequently)
      ...options,
    }),
  });
};

/**
 * Hook to fetch available staff for ownership transfer
 */
export const useAvailableStaff = (organizationId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.availableStaff(organizationId),
    queryFn: async () => {
      const data = await apiClient.get(
        `/dashboard/organizations/available-staff?organizationId=${organizationId}`
      );
      return data;
    },
    ...getDefaultQueryOptions({
      staleTime: 2 * 60 * 1000, // 2 minutes (staff list changes less frequently)
      enabled: Boolean(organizationId), // Only run if organizationId is provided
      ...options,
    }),
  });
};

/**
 * Hook to transfer organization ownership
 */
export const useOwnershipTransfer = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ organizationId, newOwnerId }) => {
      const data = await apiClient.post(
        "/dashboard/organizations/transfer-ownership",
        {
          organizationId,
          newOwnerId,
        }
      );
      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries using standardized patterns
      invalidateQueries.organization(queryClient);
      invalidateQueries.users(queryClient);
      invalidateQueries.availableStaff(queryClient, variables.organizationId);

      if (data?.ownershipTransferred) {
        // Success message will be shown in the loading overlay, not as toast
      }
    },
    ...getDefaultMutationOptions({ operation: "Ownership transfer" }),
    ...options,
  });
};

/**
 * Main Organization Management Hook
 * Provides a unified interface for all organization management operations
 */
export const useOrganizationManagement = () => {
  const organizationOverviewQuery = useOrganizationOverview();
  const ownershipTransferMutation = useOwnershipTransfer();

  return {
    ...organizationOverviewQuery,
    transferOwnership: ownershipTransferMutation,
  };
};
