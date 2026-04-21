import { useQuery } from "@tanstack/react-query";
import { useAppContext } from "@/lib/hooks/use-app-context";
import {
  getDefaultQueryOptions,
  queryKeys,
  createServiceQueryFn,
} from "@/lib/helpers/hook.helpers";
import { mockFallback } from "@/lib/mockup-data";
import { dashboardService } from "../services/dashboard.service";

export const useAnalytics = (options = {}) => {
  const { userId, isDemoMode } = useAppContext();
  const {
    timeRange = "30d",
    enabled = true,
    refetchInterval,
    ...customOptions
  } = options;

  return useQuery({
    queryKey: queryKeys.analytics(timeRange, userId),
    queryFn: createServiceQueryFn(
      () => dashboardService.getAnalytics(timeRange),
      () => mockFallback.analytics(timeRange),
      isDemoMode,
    ),
    ...getDefaultQueryOptions({
      enabled,
      refetchInterval,
      ...customOptions,
    }),
  });
};
