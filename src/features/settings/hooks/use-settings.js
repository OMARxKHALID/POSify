import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppContext } from "@/lib/hooks/use-app-context";
import {
  getDefaultQueryOptions,
  getDefaultMutationOptions,
  handleHookSuccess,
  queryKeys,
  invalidateQueries,
  createServiceQueryFn,
} from "@/lib/helpers/hook.helpers";
import { mockFallback } from "@/lib/mockup-data";
import { settingsService } from "../services/settings.service";

export const useSettings = (options = {}) => {
  const { userId, isDemoMode } = useAppContext();

  return useQuery({
    queryKey: queryKeys.settings(userId),
    queryFn: createServiceQueryFn(
      settingsService.getSettings,
      () => ({
        ...mockFallback.settings().settings,
        organizationId: "demo_org",
        organizationName: "Demo Restaurant",
        organization: { _id: "demo_org", name: "Demo Restaurant" },
      }),
      isDemoMode,
    ),
    enabled: Boolean(userId),
    ...getDefaultQueryOptions(options),
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
