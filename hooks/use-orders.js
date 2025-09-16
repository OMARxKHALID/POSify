/**
 * useOrders Hook
 * Custom hooks for order management using TanStack React Query
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

/* -------------------------------------------------------------------------- */
/*                              Fetching Hooks                                */
/* -------------------------------------------------------------------------- */

/**
 * Fetch all orders
 */
export const useOrders = (options = {}) => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: [...queryKeys.orders(), session?.user?.id],
    queryFn: () => apiClient.get("/dashboard/orders"),
    ...getDefaultQueryOptions({
      staleTime: 60 * 1000, // 1 min
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      ...options,
    }),
  });
};

/**
 * Fetch a single order by ID
 */
export const useOrder = (orderId, options = {}) => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: [...queryKeys.order(orderId), session?.user?.id],
    queryFn: () => apiClient.get(`/dashboard/orders/${orderId}`),
    enabled: Boolean(orderId),
    ...getDefaultQueryOptions({
      staleTime: 2 * 60 * 1000, // 2 min
      ...options,
    }),
  });
};

/* -------------------------------------------------------------------------- */
/*                             Mutation Hooks                                 */
/* -------------------------------------------------------------------------- */

/**
 * Create a new order
 */
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderData) =>
      apiClient.post("/dashboard/orders/create", orderData),
    onSuccess: () => {
      invalidateQueries.orders(queryClient);
      handleHookSuccess("ORDER_CREATED_SUCCESSFULLY");
    },
    ...getDefaultMutationOptions({ operation: "Order creation" }),
  });
};

/**
 * Edit an existing order
 */
export const useEditOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, orderData }) =>
      apiClient.put(`/dashboard/orders/${orderId}`, orderData),
    onSuccess: (_, variables) => {
      invalidateQueries.orders(queryClient);
      invalidateQueries.order(queryClient, variables.orderId);
      handleHookSuccess("ORDER_UPDATED_SUCCESSFULLY");
    },
    ...getDefaultMutationOptions({ operation: "Order update" }),
  });
};

/**
 * Update order status
 */
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status, notes }) =>
      apiClient.put(`/dashboard/orders/${orderId}/status`, { status, notes }),
    onSuccess: (_, variables) => {
      invalidateQueries.orders(queryClient);
      invalidateQueries.order(queryClient, variables.orderId);
      handleHookSuccess("ORDER_STATUS_UPDATED_SUCCESSFULLY");
    },
    ...getDefaultMutationOptions({ operation: "Order status update" }),
  });
};

/**
 * Delete (cancel) an order
 */
export const useDeleteOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId) => apiClient.delete(`/dashboard/orders/${orderId}`),
    onSuccess: (_, orderId) => {
      invalidateQueries.orders(queryClient);
      invalidateQueries.order(queryClient, orderId);
      handleHookSuccess("ORDER_DELETED_SUCCESSFULLY");
    },
    ...getDefaultMutationOptions({ operation: "Order deletion" }),
  });
};

/**
 * Process a refund
 */
export const useProcessRefund = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, refundData }) =>
      apiClient.post(`/dashboard/orders/${orderId}/refund`, refundData),
    onSuccess: (_, variables) => {
      invalidateQueries.orders(queryClient);
      invalidateQueries.order(queryClient, variables.orderId);
      handleHookSuccess("REFUND_PROCESSED_SUCCESSFULLY");
    },
    ...getDefaultMutationOptions({ operation: "Refund processing" }),
  });
};

/* -------------------------------------------------------------------------- */
/*                      Unified Orders Management Hook                        */
/* -------------------------------------------------------------------------- */

export const useOrdersManagement = () => {
  const ordersQuery = useOrders();
  return {
    ...ordersQuery,
    createOrder: useCreateOrder(),
    editOrder: useEditOrder(),
    updateOrderStatus: useUpdateOrderStatus(),
    deleteOrder: useDeleteOrder(),
    processRefund: useProcessRefund(),
  };
};
