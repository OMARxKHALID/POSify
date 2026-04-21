import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppContext } from "@/lib/hooks/use-app-context";
import {
  getDefaultQueryOptions,
  getDefaultMutationOptions,
  handleHookSuccess,
  queryKeys,
  invalidateQueries,
  createServiceQueryFn,
} from "@/lib/helpers/hook.helpers";
import { mockFallback } from "@/lib/mockup-data";
import { dashboardService } from "../services/dashboard.service";

export const useTransactions = (options = {}) => {
  const { userId, isDemoMode } = useAppContext();

  return useQuery({
    queryKey: queryKeys.transactions(userId),
    queryFn: createServiceQueryFn(
      dashboardService.getTransactions,
      () => mockFallback.transactions(),
      isDemoMode,
    ),
    ...getDefaultQueryOptions(options),
  });
};

export const useTransaction = (transactionId, options = {}) => {
  const { userId, isDemoMode } = useAppContext();

  return useQuery({
    queryKey: queryKeys.transaction(transactionId, userId),
    queryFn: createServiceQueryFn(
      () => dashboardService.getTransactionById(transactionId),
      () => mockFallback.transactions().transactions.find(t => t._id === transactionId) || mockFallback.transactions().transactions[0],
      isDemoMode,
    ),
    enabled: Boolean(transactionId),
    ...getDefaultQueryOptions(options),
  });
};

export const useTransactionStats = (options = {}) => {
  const { userId, isDemoMode } = useAppContext();

  return useQuery({
    queryKey: queryKeys.transactionStats(userId),
    queryFn: createServiceQueryFn(
      dashboardService.getTransactionStats,
      () => mockFallback.transactions().stats,
      isDemoMode,
    ),
    ...getDefaultQueryOptions(options),
  });
};

export const useTransactionsWithFilters = (filters = {}, options = {}) => {
  const { userId, isDemoMode } = useAppContext();

  return useQuery({
    queryKey: queryKeys.transactionsFiltered(filters, userId),
    queryFn: createServiceQueryFn(
      () => dashboardService.getTransactions(filters),
      () => mockFallback.transactions(),
      isDemoMode,
    ),
    ...getDefaultQueryOptions(options),
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
