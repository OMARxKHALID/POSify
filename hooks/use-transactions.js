/**
 * useTransactions Hook
 * Custom hooks for transaction management using TanStack React Query
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
  isDemoModeEnabled,
} from "@/lib/hooks/hook-utils";
import { mockFallback, isDataEmpty } from "@/lib/mockup-data";

/* -------------------------------------------------------------------------- */
/*                              Fetching Hooks                                */
/* -------------------------------------------------------------------------- */

/**
 * Fetch all transactions
 */
export const useTransactions = (options = {}) => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: [...queryKeys.transactions(), session?.user?.id],
    queryFn: async () => {
      try {
        const data = await apiClient.get("/dashboard/transactions");
        if (isDemoModeEnabled() && isDataEmpty(data)) {
          return mockFallback.transactions().data;
        }
        return data;
      } catch (error) {
        if (isDemoModeEnabled()) {
          console.warn("Transactions API failed, using demo data:", error.message);
          return mockFallback.transactions().data;
        }
        throw error;
      }
    },
    ...getDefaultQueryOptions({
      staleTime: 60 * 1000, // 1 min
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      ...options,
    }),
  });
};

/**
 * Fetch a single transaction by ID
 */
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

/**
 * Fetch transaction statistics
 */
export const useTransactionStats = (options = {}) => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: [...queryKeys.transactionStats(), session?.user?.id],
    queryFn: async () => {
      try {
        const data = await apiClient.get("/dashboard/transactions/stats");
        if (isDemoModeEnabled() && isDataEmpty(data)) {
          return mockFallback.transactionsStats ? mockFallback.transactionsStats().data : mockFallback.transactions().data;
        }
        return data;
      } catch (error) {
        if (isDemoModeEnabled()) {
          console.warn("Transaction Stats API failed, using demo data:", error.message);
          return mockFallback.transactionsStats ? mockFallback.transactionsStats().data : mockFallback.transactions().data;
        }
        throw error;
      }
    },
    ...getDefaultQueryOptions({
      staleTime: 2 * 60 * 1000, // 2 min
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      ...options,
    }),
  });
};

/**
 * Fetch transactions with filters
 */
export const useTransactionsWithFilters = (filters = {}, options = {}) => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: [
      ...queryKeys.transactions(),
      "filtered",
      filters,
      session?.user?.id,
    ],
    queryFn: async () => {
      try {
        const data = await apiClient.get("/dashboard/transactions", { params: filters });
        if (isDemoModeEnabled() && isDataEmpty(data)) {
          return mockFallback.transactions().data;
        }
        return data;
      } catch (error) {
        if (isDemoModeEnabled()) {
          console.warn("Transactions API failed, using demo data:", error.message);
          return mockFallback.transactions().data;
        }
        throw error;
      }
    },
    ...getDefaultQueryOptions({
      staleTime: 60 * 1000, // 1 min
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      ...options,
    }),
  });
};

/* -------------------------------------------------------------------------- */
/*                              Mutation Hooks                                */
/* -------------------------------------------------------------------------- */

/**
 * Create a new transaction
 */
export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transactionData) =>
      apiClient.post("/dashboard/transactions/create", transactionData),
    ...getDefaultMutationOptions({
      onSuccess: () => {
        handleHookSuccess("TRANSACTION_CREATED_SUCCESSFULLY");
        invalidateQueries.transactions(queryClient);
        invalidateQueries.transactionStats(queryClient);
      },
      operation: "Transaction creation",
    }),
  });
};

/* -------------------------------------------------------------------------- */
/*                      Unified Transactions Management Hook                  */
/* -------------------------------------------------------------------------- */

export const useTransactionsManagement = () => {
  const transactionsQuery = useTransactions();
  const statsQuery = useTransactionStats();

  return {
    ...transactionsQuery,
    stats: statsQuery,
    createTransaction: useCreateTransaction(),
    getTransaction: useTransaction,
  };
};
