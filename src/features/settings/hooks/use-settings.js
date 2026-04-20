import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/lib/mock-auth";
import {
  getDefaultQueryOptions,
  getDefaultMutationOptions,
  handleHookSuccess,
  queryKeys,
  invalidateQueries,
  createServiceQueryFn,
} from "@/lib/helpers/hook.helpers";
import { useIsDemoModeEnabled } from "@/features/settings/hooks/use-demo-mode";
import { mockFallback } from "@/lib/mockup-data";
import { settingsService } from "../services/settings.service";

export const useSettings = (options = {}) => {
  const { data: session } = useSession();
  const isDemoMode = useIsDemoModeEnabled();

  const queryOptions = getDefaultQueryOptions({
    staleTime: 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 1,
    ...options,
  });

  return useQuery({
    queryKey: [...queryKeys.settings(), session?.user?.id],
    queryFn: createServiceQueryFn(
      settingsService.getSettings,
      () => {
        const mockData = mockFallback.settings().data;
        // Mock fallback logic preserved for demo mode
        return {
          ...mockData.settings,
          organizationId: "demo_org",
          organizationName: "Demo Restaurant",
          organization: { _id: "demo_org", name: "Demo Restaurant" },
          isDemo: true,
        };
      },
      isDemoMode,
    ),
    enabled: !!session?.user?.id,
    ...queryOptions,
  });
};

export const useUpdateSettings = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settingsData) => settingsService.updateSettings(settingsData),
    onSuccess: () => {
      invalidateQueries.settings(queryClient);
      handleHookSuccess("SETTINGS_UPDATED_SUCCESSFULLY");
    },
    ...getDefaultMutationOptions({ operation: "Settings update" }),
    ...options,
  });
};

export const useSettingsManagement = () => {
  const settingsQuery = useSettings();

  return {
    ...settingsQuery,
    updateSettings: useUpdateSettings(),
  };
};
