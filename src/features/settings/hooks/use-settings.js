import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/lib/mock-auth";
import { apiClient } from "@/lib/api-client";
import {
  getDefaultQueryOptions,
  handleHookSuccess,
  queryKeys,
  invalidateQueries,
} from "@/lib/helpers/hook.helpers";
import { useIsDemoModeEnabled } from "@/features/settings/hooks/use-demo-mode";
import { mockFallback, isDataEmpty } from "@/lib/mockup-data";

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

  const queryKey = [...queryKeys.settings(), session?.user?.id];

  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const data = await apiClient.get("/dashboard/settings");

        const processData = (sourceData) => {
          const { settings, organization, currentUser } = sourceData;
          const organizationId = settings?.organizationId || organization?._id;
          const userRole = currentUser?.role;

          return {
            ...settings,
            organizationId,
            organizationName: organization?.name,
            organization,
            currentUser,
            userRole,
            userId: currentUser?._id,
            isAdmin: userRole === "admin",
            isStaff: userRole === "staff",
            isOwner:
              userRole === "admin" && organization?.owner === currentUser?._id,
            _raw: sourceData,
          };
        };

        if (isDemoMode && isDataEmpty(data)) {
          return {
            ...processData(mockFallback.settings().data),
            isDemo: true,
          };
        }

        const result = processData(data);

        if (!result.organizationId) {
          throw new Error("Organization ID not found in settings response");
        }

        return result;
      } catch (error) {
        if (isDemoMode) {
          console.warn("Settings API failed, using demo data:", error.message);
          return {
            ...mockFallback.settings().data.settings,
            organizationId: "demo_org",
            organizationName: "Demo Restaurant",
            organization: { _id: "demo_org", name: "Demo Restaurant" },
            isDemo: true,
          };
        }
        throw error;
      }
    },
    enabled: !!session?.user?.id,
    ...queryOptions,
  });
};

export const useUpdateSettings = (options = {}) => {
  const queryClient = useQueryClient();

  const defaultOptions = {
    onSuccess: () => {
      invalidateQueries.settings(queryClient);
      handleHookSuccess("SETTINGS_UPDATED_SUCCESSFULLY");
    },
    onError: (error) => {
      handleHookError(error, "Settings update");
    },
  };

  return useMutation({
    mutationFn: (settingsData) =>
      apiClient.put("/dashboard/settings", settingsData),
    ...defaultOptions,
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
