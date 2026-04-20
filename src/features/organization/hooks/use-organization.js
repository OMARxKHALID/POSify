import {
  useQuery,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  getDefaultQueryOptions,
  getDefaultMutationOptions,
  queryKeys,
  invalidateQueries,
  createServiceQueryFn,
} from "@/lib/helpers/hook.helpers";
import { useIsDemoModeEnabled } from "@/features/settings/hooks/use-demo-mode";
import { mockFallback } from "@/lib/mockup-data";
import { organizationService } from "../services/organization.service";

export const useOrganizationOverview = (options = {}) => {
  const isDemoMode = useIsDemoModeEnabled();

  return useQuery({
    queryKey: queryKeys.organization(),
    queryFn: createServiceQueryFn(
      organizationService.getOverview,
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
    queryFn: createServiceQueryFn(
      organizationService.getOverview,
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
    queryFn: createServiceQueryFn(
      () => organizationService.getAvailableStaff(organizationId),
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
      organizationService.transferOwnership(organizationId, newOwnerId),
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
