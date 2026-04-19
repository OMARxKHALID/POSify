import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/lib/mock-auth";
import { apiClient } from "@/lib/api-client";
import {
  getDefaultQueryOptions,
  getDefaultMutationOptions,
  handleHookSuccess,
  queryKeys,
  invalidateQueries,
  createDemoQueryFn,
} from "@/lib/helpers/hook-helpers";
import { useIsDemoModeEnabled } from "@/hooks/use-demo-mode";
import { mockFallback } from "@/lib/mockup-data";

export const useTransactions = (options = {}) => {
  const { data: session } = useSession();
  const isDemoMode = useIsDemoModeEnabled();

  return useQuery({
    queryKey: [...queryKeys.transactions(), session?.user?.id],
    queryFn: createDemoQueryFn(
      "/dashboard/transactions",
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
    queryFn: () => apiClient.get(`/dashboard/transactions/${transactionId}`),
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
    queryFn: createDemoQueryFn(
      "/dashboard/transactions/stats",
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
    queryFn: createDemoQueryFn(
      "/dashboard/transactions",
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
    mutationFn: (transactionData) =>
      apiClient.post("/dashboard/transactions/create", transactionData),
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
