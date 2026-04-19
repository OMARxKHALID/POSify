import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { apiClient } from "@/lib/api-client";
import {
  getDefaultQueryOptions,
  handleHookSuccess,
  handleHookError, // Import error handler
  queryKeys,
  invalidateQueries,
  isDemoModeEnabled,
} from "@/lib/hooks/hook-utils";
import { mockFallback, isDataEmpty } from "@/lib/mockup-data";

export const useSettings = (options = {}) => {
  const { data: session } = useSession();

  const queryOptions = getDefaultQueryOptions({
    staleTime: 60 * 1000, // 1 minute
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
          const organizationId = settings?.organizationId || organization?.id;
          const userRole = currentUser?.role;

          return {
            ...settings,
            organizationId,
            organizationName: organization?.name,
            organization,
            currentUser,
            userRole,
            userId: currentUser?.id,
            isAdmin: userRole === "admin",
            isStaff: userRole === "staff",
            isOwner:
              userRole === "admin" && organization?.owner === currentUser?.id,
            _raw: sourceData,
          };
        };

        if (isDemoModeEnabled() && isDataEmpty(data)) {
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
        if (isDemoModeEnabled()) {
          console.warn("Settings API failed, using demo data:", error.message);
          return {
            ...mockFallback.settings().data.settings,
            organizationId: "demo_org",
            organizationName: "Demo Restaurant",
            organization: { id: "demo_org", name: "Demo Restaurant" },
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
    ...options, // Allow overriding defaults
  });
};

export const useSettingsManagement = () => {
  const settingsQuery = useSettings();

  return {
    ...settingsQuery,
    updateSettings: useUpdateSettings(),
  };
};
