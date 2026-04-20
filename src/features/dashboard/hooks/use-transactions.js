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
import { dashboardService } from "../services/dashboard.service";

export const useTransactions = (options = {}) => {
  const { data: session } = useSession();
  const isDemoMode = useIsDemoModeEnabled();

  return useQuery({
    queryKey: [...queryKeys.transactions(), session?.user?.id],
    queryFn: createServiceQueryFn(
      dashboardService.getTransactions,
      () => mockFallback.transactions().data,
      isDemoMode,
    ),
    ...getDefaultQueryOptions({
      staleTime: 60 * 1000,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      ...options,
    }),
  });
};

export const useTransaction = (transactionId, options = {}) => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: [...queryKeys.transaction(transactionId), session?.user?.id],
    queryFn: () => dashboardService.getTransactionById(transactionId),
    enabled: Boolean(transactionId),
    ...getDefaultQueryOptions({
      staleTime: 2 * 60 * 1000,
      ...options,
    }),
  });
};

export const useTransactionStats = (options = {}) => {
  const { data: session } = useSession();
  const isDemoMode = useIsDemoModeEnabled();

  return useQuery({
    queryKey: [...queryKeys.transactionStats(), session?.user?.id],
    queryFn: createServiceQueryFn(
      dashboardService.getTransactionStats,
      () => mockFallback.transactions().data.stats,
      isDemoMode,
    ),
    ...getDefaultQueryOptions({
      staleTime: 2 * 60 * 1000,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      ...options,
    }),
  });
};

export const useTransactionsWithFilters = (filters = {}, options = {}) => {
  const { data: session } = useSession();
  const isDemoMode = useIsDemoModeEnabled();

  return useQuery({
    queryKey: [
      ...queryKeys.transactions(),
      "filtered",
      JSON.stringify(filters),
      session?.user?.id,
    ],
    queryFn: createServiceQueryFn(
      () => dashboardService.getTransactions(filters),
      () => mockFallback.transactions().data,
      isDemoMode,
    ),
    ...getDefaultQueryOptions({
      staleTime: 60 * 1000,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      ...options,
    }),
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transactionData) => dashboardService.createTransaction(transactionData),
    onSuccess: () => {
      handleHookSuccess("TRANSACTION_CREATED_SUCCESSFULLY");
      invalidateQueries.transactions(queryClient);
      invalidateQueries.transactionStats(queryClient);
    },
    ...getDefaultMutationOptions({ operation: "Transaction creation" }),
  });
};

export const useTransactionsManagement = () => {
  const transactionsQuery = useTransactions();
  const statsQuery = useTransactionStats();
  const createTransaction = useCreateTransaction();

  return {
    ...transactionsQuery,
    stats: statsQuery,
    createTransaction,
    useGetTransaction: useTransaction,
  };
};
