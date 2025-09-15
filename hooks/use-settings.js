/**
 * useSettings Hook
 * Custom hook for settings management operations using TanStack React Query
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

/**
 * Hook to fetch settings based on authenticated user's role and permissions
 */
export const useSettings = (options = {}) => {
  const { data: session } = useSession();

  const queryOptions = getDefaultQueryOptions({
    staleTime: 10 * 60 * 1000, // 10 minutes (settings don't change frequently)
    refetchOnMount: false, // Don't refetch on mount unless needed
    refetchOnWindowFocus: false, // Don't refetch on window focus
    ...options,
  });

  return useQuery({
    queryKey: [...queryKeys.settings(), session?.user?.id],
    queryFn: async () => {
      const data = await apiClient.get("/dashboard/settings");
      return data;
    },
    ...queryOptions,
  });
};

/**
 * Settings Update Hook
 * Updates organization settings
 */
export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settingsData) => {
      const response = await apiClient.put("/dashboard/settings", settingsData);
      return response;
    },
    onSuccess: () => {
      invalidateQueries.settings(queryClient);
      handleHookSuccess("SETTINGS_UPDATED_SUCCESSFULLY");
    },
    ...getDefaultMutationOptions({ operation: "Settings update" }),
  });
};

/**
 * Tax Settings Hook
 * Updates tax settings
 */
export const useUpdateTaxSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taxData) => {
      const response = await apiClient.post(
        "/dashboard/settings/taxes",
        taxData
      );
      return response;
    },
    onSuccess: () => {
      invalidateQueries.settings(queryClient);
      handleHookSuccess("TAX_SETTINGS_UPDATED_SUCCESSFULLY");
    },
    ...getDefaultMutationOptions({ operation: "Tax settings update" }),
  });
};

/**
 * Payment Settings Hook
 * Updates payment settings
 */
export const useUpdatePaymentSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentData) => {
      const response = await apiClient.post(
        "/dashboard/settings/payment",
        paymentData
      );
      return response;
    },
    onSuccess: () => {
      invalidateQueries.settings(queryClient);
      handleHookSuccess("PAYMENT_SETTINGS_UPDATED_SUCCESSFULLY");
    },
    ...getDefaultMutationOptions({ operation: "Payment settings update" }),
  });
};

/**
 * Business Settings Hook
 * Updates business settings
 */
export const useUpdateBusinessSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (businessData) => {
      const response = await apiClient.post(
        "/dashboard/settings/business",
        businessData
      );
      return response;
    },
    onSuccess: () => {
      invalidateQueries.settings(queryClient);
      handleHookSuccess("BUSINESS_SETTINGS_UPDATED_SUCCESSFULLY");
    },
    ...getDefaultMutationOptions({ operation: "Business settings update" }),
  });
};

/**
 * Localization Settings Hook
 * Updates localization settings
 */
export const useUpdateLocalizationSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (localizationData) => {
      const response = await apiClient.post(
        "/dashboard/settings/localization",
        localizationData
      );
      return response;
    },
    onSuccess: () => {
      invalidateQueries.settings(queryClient);
      handleHookSuccess("LOCALIZATION_SETTINGS_UPDATED_SUCCESSFULLY");
    },
    ...getDefaultMutationOptions({ operation: "Localization settings update" }),
  });
};

/**
 * Main Settings Management Hook
 * Provides a unified interface for all settings management operations
 */
export const useSettingsManagement = () => {
  const settingsQuery = useSettings();
  const updateSettingsMutation = useUpdateSettings();
  const updateTaxSettingsMutation = useUpdateTaxSettings();
  const updatePaymentSettingsMutation = useUpdatePaymentSettings();
  const updateBusinessSettingsMutation = useUpdateBusinessSettings();
  const updateLocalizationSettingsMutation = useUpdateLocalizationSettings();

  return {
    ...settingsQuery,
    updateSettings: updateSettingsMutation,
    updateTaxSettings: updateTaxSettingsMutation,
    updatePaymentSettings: updatePaymentSettingsMutation,
    updateBusinessSettings: updateBusinessSettingsMutation,
    updateLocalizationSettings: updateLocalizationSettingsMutation,
  };
};
