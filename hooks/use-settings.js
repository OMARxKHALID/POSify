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
    staleTime: 5 * 60 * 1000, // 5 minutes (settings don't change frequently)
    refetchOnMount: false, // Don't refetch on mount to prevent multiple requests
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: false, // Don't refetch on reconnect
    retry: 1, // Only retry once to prevent multiple requests
    ...options,
  });

  const queryKey = [...queryKeys.settings(), session?.user?.id];

  console.log(
    "🔧 [DEBUG] useSettings - Query key:",
    queryKey,
    "Session user ID:",
    session?.user?.id
  );

  return useQuery({
    queryKey,
    queryFn: async () => {
      console.log(
        "🔧 [DEBUG] useSettings - Fetching settings for user:",
        session?.user?.id,
        "Timestamp:",
        new Date().toISOString()
      );
      try {
        const data = await apiClient.get("/dashboard/settings");
        console.log("🔧 [DEBUG] useSettings - API response:", data);

        // Extract data with fallbacks for robustness
        const { settings, organization, currentUser } = data;
        const organizationId = settings?.organizationId || organization?.id;
        const userRole = currentUser?.role;

        // Enhanced debugging to identify the issue
        console.log("🔧 [DEBUG] useSettings - Extracted data:", {
          settingsOrganizationId: settings?.organizationId,
          organizationId: organization?.id,
          finalOrganizationId: organizationId,
          userRole,
          hasSettings: !!settings,
          hasOrganization: !!organization,
          hasCurrentUser: !!currentUser,
        });

        // ✅ Future-proof data structure with proper organizationId extraction
        const result = {
          // Core settings data (flattened for easy access)
          ...settings,

          // Organization context
          organizationId,
          organizationName: organization?.name,
          organization,

          // User context
          currentUser,
          userRole,
          userId: currentUser?.id,

          // Role-based convenience flags
          isAdmin: userRole === "admin",
          isStaff: userRole === "staff",
          isOwner:
            userRole === "admin" && organization?.owner === currentUser?.id,

          // Raw response for advanced use cases
          _raw: data,
        };

        // Additional validation to ensure organizationId is present
        if (!result.organizationId) {
          console.error(
            "🔧 [DEBUG] useSettings - No organizationId found in result:",
            result
          );
          throw new Error("Organization ID not found in settings response");
        }

        console.log("🔧 [DEBUG] useSettings - Final result:", {
          organizationId: result.organizationId,
          hasOrganizationId: !!result.organizationId,
          resultKeys: Object.keys(result),
        });

        return result;
      } catch (error) {
        console.error("🔧 [DEBUG] useSettings - API error:", error);
        throw error;
      }
    },
    enabled: !!session?.user?.id, // Only run when user is authenticated
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
