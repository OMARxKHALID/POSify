import { useQuery } from "@tanstack/react-query";
import {
  getDefaultQueryOptions,
  queryKeys,
  createDemoQueryFn,
} from "@/lib/helpers/hook.helpers";
import { useIsDemoModeEnabled } from "@/features/settings/hooks/use-demo-mode";
import { mockFallback } from "@/lib/mockup-data";

export const useAnalytics = (options = {}) => {
  const isDemoMode = useIsDemoModeEnabled();
  const {
    timeRange = "30d",
    enabled = true,
    refetchInterval,
    ...customOptions
  } = options;

  return useQuery({
    queryKey: queryKeys.analytics(timeRange),
    queryFn: createDemoQueryFn(
      `/dashboard/analytics?timeRange=${timeRange}`,
      () => mockFallback.analytics(timeRange).data,
      isDemoMode,
    ),
    ...getDefaultQueryOptions({
      enabled,
      refetchInterval,
      staleTime: 2 * 60 * 1000,
      ...customOptions,
    }),
  });
};
