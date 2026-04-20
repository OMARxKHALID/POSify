import {
  useQuery,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import {
  getDefaultQueryOptions,
  getDefaultMutationOptions,
  handleHookSuccess,
  queryKeys,
  invalidateQueries,
  createDemoQueryFn,
} from "@/lib/helpers/hook.helpers";
import { useIsDemoModeEnabled } from "@/features/settings/hooks/use-demo-mode";
import { mockFallback } from "@/lib/mockup-data";

export const useOrganizationOverview = (options = {}) => {
  const isDemoMode = useIsDemoModeEnabled();

  return useQuery({
    queryKey: queryKeys.organization(),
    queryFn: createDemoQueryFn(
      "/organizations/overview",
      () => mockFallback.organization().data,
      isDemoMode,
    ),
    ...getDefaultQueryOptions({
      staleTime: 5 * 60 * 1000,
      ...options,
    }),
  });
};

export const useSuspenseOrganizationOverview = (options = {}) => {
  const isDemoMode = useIsDemoModeEnabled();

  return useSuspenseQuery({
    queryKey: queryKeys.organization(),
    queryFn: createDemoQueryFn(
      "/organizations/overview",
      () => mockFallback.organization().data,
      isDemoMode,
    ),
    ...getDefaultQueryOptions({
      staleTime: 5 * 60 * 1000,
      ...options,
    }),
  });
};

export const useAvailableStaff = (organizationId, options = {}) => {
  const isDemoMode = useIsDemoModeEnabled();

  return useQuery({
    queryKey: queryKeys.availableStaff(organizationId),
    queryFn: createDemoQueryFn(
      `/dashboard/organizations/available-staff?organizationId=${organizationId}`,
      () => mockFallback.users().data,
      isDemoMode,
    ),
    ...getDefaultQueryOptions({
      staleTime: 2 * 60 * 1000,
      enabled: Boolean(organizationId),
      ...options,
    }),
  });
};

export const useOwnershipTransfer = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ organizationId, newOwnerId }) =>
      apiClient.post("/dashboard/organizations/transfer-ownership", {
        organizationId,
        newOwnerId,
      }),
    onSuccess: (_, variables) => {
      invalidateQueries.organization(queryClient);
      invalidateQueries.users(queryClient);
      invalidateQueries.availableStaff(queryClient, variables.organizationId);
    },
    ...getDefaultMutationOptions({ operation: "Ownership transfer" }),
    ...options,
  });
};

export const useOrganizationManagement = () => {
  const organizationOverviewQuery = useOrganizationOverview();
  const ownershipTransferMutation = useOwnershipTransfer();

  return {
    ...organizationOverviewQuery,
    transferOwnership: ownershipTransferMutation,
  };
};
