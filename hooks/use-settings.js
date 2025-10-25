/**
 * useSettings Hooks
 * Manage application/organization settings via TanStack React Query.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { apiClient } from "@/lib/api-client";
import {
  getDefaultQueryOptions,
  getDefaultMutationOptions,
  handleHookSuccess,
  handleHookError, // Import error handler
  queryKeys,
  invalidateQueries,
} from "@/lib/hooks/hook-utils";

/* ----------------------------- FETCH SETTINGS ---------------------------- */

/**
 * Fetch settings for the authenticated user’s organization.
 */
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
      const data = await apiClient.get("/dashboard/settings");

      const { settings, organization, currentUser } = data;
      const organizationId = settings?.organizationId || organization?.id;
      const userRole = currentUser?.role;

      const result = {
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
        _raw: data,
      };

      if (!result.organizationId) {
        throw new Error("Organization ID not found in settings response");
      }

      return result;
    },
    enabled: !!session?.user?.id,
    ...queryOptions,
  });
};

/* ----------------------------- UPDATE HOOKS ------------------------------ */

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

/* ----------------------- UNIFIED MANAGEMENT HOOK ------------------------- */

/**
 * Provides a single interface for querying and updating all settings.
 */
export const useSettingsManagement = () => {
  const settingsQuery = useSettings();

  return {
    ...settingsQuery,
    updateSettings: useUpdateSettings(),
  };
};
