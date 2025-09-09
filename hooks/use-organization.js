/**
 * useOrganization Hook
 * Custom hook for fetching organization data using TanStack React Query
 */

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { getDefaultQueryOptions, queryKeys } from "@/lib/hooks/hook-utils";

/**
 * Hook to fetch organization overview data
 */
export const useOrganizationOverview = (options = {}) => {
  const queryOptions = getDefaultQueryOptions({
    staleTime: 5 * 60 * 1000, // 5 minutes (organization data changes less frequently)
    ...options,
  });

  return useQuery({
    queryKey: queryKeys.organization,
    queryFn: async () => {
      const data = await apiClient.get("/organizations/overview");
      return data;
    },
    ...queryOptions,
  });
};
