/**
 * useAnalytics Hook
 * Custom hook for fetching analytics data using TanStack React Query
 */

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { 
  getDefaultQueryOptions, 
  queryKeys,
  isDemoModeEnabled 
} from "@/lib/hooks/hook-utils";
import { mockFallback, isDataEmpty } from "@/lib/mockup-data";

/**
 * Hook to fetch analytics data with time range filtering
 */
export const useAnalytics = (options = {}) => {
  const {
    timeRange = "30d",
    enabled = true,
    refetchInterval,
    ...customOptions
  } = options;

  const queryOptions = getDefaultQueryOptions({
    enabled,
    refetchInterval,
    staleTime: 2 * 60 * 1000, // 2 minutes (analytics data changes frequently)
    ...customOptions,
  });

  return useQuery({
    queryKey: queryKeys.analytics(timeRange),
    queryFn: async () => {
      try {
        const data = await apiClient.get(
          `/dashboard/analytics?timeRange=${timeRange}`
        );
        if (isDemoModeEnabled() && isDataEmpty(data)) {
          return mockFallback.analytics(timeRange).data;
        }
        return data;
      } catch (error) {
        if (isDemoModeEnabled()) {
          console.warn("Analytics API failed, using demo data:", error.message);
          return mockFallback.analytics(timeRange).data;
        }
        throw error;
      }
    },
    ...queryOptions,
  });
};
