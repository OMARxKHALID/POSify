/**
 * useAnalytics Hook
 * Custom hook for fetching analytics data using TanStack React Query
 */

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

/**
 * Hook to fetch analytics data
 */
export const useAnalytics = (options = {}) => {
  const {
    timeRange = "30d",
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
    retry = 2,
    refetchInterval,
    ...queryOptions
  } = options;

  return useQuery({
    queryKey: ["analytics", timeRange],
    queryFn: () => apiClient.get(`/dashboard/analytics?timeRange=${timeRange}`),
    enabled,
    staleTime,
    retry,
    refetchInterval,
    ...queryOptions,
  });
};
