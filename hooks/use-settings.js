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
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
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

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settingsData) =>
      apiClient.put("/dashboard/settings", settingsData),
    onSuccess: () => {
      invalidateQueries.settings(queryClient);
      handleHookSuccess("SETTINGS_UPDATED_SUCCESSFULLY");
    },
    ...getDefaultMutationOptions({ operation: "Settings update" }),
  });
};

export const useUpdateTaxSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taxData) =>
      apiClient.post("/dashboard/settings/taxes", taxData),
    onSuccess: () => {
      invalidateQueries.settings(queryClient);
      handleHookSuccess("TAX_SETTINGS_UPDATED_SUCCESSFULLY");
    },
    ...getDefaultMutationOptions({ operation: "Tax settings update" }),
  });
};

export const useUpdatePaymentSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentData) =>
      apiClient.post("/dashboard/settings/payment", paymentData),
    onSuccess: () => {
      invalidateQueries.settings(queryClient);
      handleHookSuccess("PAYMENT_SETTINGS_UPDATED_SUCCESSFULLY");
    },
    ...getDefaultMutationOptions({ operation: "Payment settings update" }),
  });
};

export const useUpdateBusinessSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (businessData) =>
      apiClient.post("/dashboard/settings/business", businessData),
    onSuccess: () => {
      invalidateQueries.settings(queryClient);
      handleHookSuccess("BUSINESS_SETTINGS_UPDATED_SUCCESSFULLY");
    },
    ...getDefaultMutationOptions({ operation: "Business settings update" }),
  });
};

export const useUpdateLocalizationSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (localizationData) =>
      apiClient.post("/dashboard/settings/localization", localizationData),
    onSuccess: () => {
      invalidateQueries.settings(queryClient);
      handleHookSuccess("LOCALIZATION_SETTINGS_UPDATED_SUCCESSFULLY");
    },
    ...getDefaultMutationOptions({ operation: "Localization settings update" }),
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
    updateTaxSettings: useUpdateTaxSettings(),
    updatePaymentSettings: useUpdatePaymentSettings(),
    updateBusinessSettings: useUpdateBusinessSettings(),
    updateLocalizationSettings: useUpdateLocalizationSettings(),
  };
};
