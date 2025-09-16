/**
 * useOrders Hook
 * Custom hook for order management operations using TanStack React Query
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
 * Hook to fetch orders based on authenticated user's role and permissions
 */
export const useOrders = (options = {}) => {
  const { data: session } = useSession();

  const queryOptions = getDefaultQueryOptions({
    staleTime: 1 * 60 * 1000, // 1 minute (orders data changes frequently)
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
    ...options,
  });

  return useQuery({
    queryKey: [...queryKeys.orders(), session?.user?.id], // Include session user ID in query key to force refresh on session change
    queryFn: async () => {
      const data = await apiClient.get("/dashboard/orders");
      return data;
    },
    ...queryOptions,
  });
};

/**
 * Hook to fetch a single order by ID
 */
export const useOrder = (orderId, options = {}) => {
  const { data: session } = useSession();

  const queryOptions = getDefaultQueryOptions({
    staleTime: 2 * 60 * 1000, // 2 minutes (single order data changes less frequently)
    enabled: Boolean(orderId), // Only run if orderId is provided
    ...options,
  });

  return useQuery({
    queryKey: [...queryKeys.order(orderId), session?.user?.id],
    queryFn: async () => {
      const data = await apiClient.get(`/dashboard/orders/${orderId}`);
      return data;
    },
    ...queryOptions,
  });
};

/**
 * Order Creation Hook
 * Creates a new order (admin and staff only)
 */
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData) => {
      console.log("🔄 [DEBUG] useCreateOrder - Starting order creation:", {
        orderData: {
          ...orderData,
          items: orderData.items?.map((item) => ({
            menuItem: item.menuItem,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
        },
        organizationId: orderData.organizationId,
        itemsCount: orderData.items?.length,
        total: orderData.total,
        customerName: orderData.customerName,
        paymentMethod: orderData.paymentMethod,
      });

      const response = await apiClient.post(
        "/dashboard/orders/create",
        orderData
      );

      console.log(
        "🔄 [DEBUG] useCreateOrder - Order creation response:",
        response
      );
      return response;
    },
    onSuccess: (data) => {
      console.log(
        "🔄 [DEBUG] useCreateOrder - Order creation successful:",
        data
      );
      invalidateQueries.orders(queryClient);
      handleHookSuccess("ORDER_CREATED_SUCCESSFULLY");
    },
    onError: (error) => {
      console.error("🔄 [DEBUG] useCreateOrder - Order creation failed:", {
        error: error.message,
        code: error.code,
        statusCode: error.statusCode,
        details: error.details,
      });
    },
    ...getDefaultMutationOptions({ operation: "Order creation" }),
  });
};

/**
 * Order Edit Hook
 * Edits/updates an existing order
 */
export const useEditOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, orderData }) => {
      const response = await apiClient.put(
        `/dashboard/orders/${orderId}`,
        orderData
      );
      return response;
    },
    onSuccess: (data, variables) => {
      invalidateQueries.orders(queryClient);
      invalidateQueries.order(queryClient, variables.orderId);
      handleHookSuccess("ORDER_UPDATED_SUCCESSFULLY");
    },
    ...getDefaultMutationOptions({ operation: "Order update" }),
  });
};

/**
 * Order Status Update Hook
 * Updates order status with validation
 */
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status, notes }) => {
      const response = await apiClient.put(
        `/dashboard/orders/${orderId}/status`,
        { status, notes }
      );
      return response;
    },
    onSuccess: (data, variables) => {
      invalidateQueries.orders(queryClient);
      invalidateQueries.order(queryClient, variables.orderId);
      handleHookSuccess("ORDER_STATUS_UPDATED_SUCCESSFULLY");
    },
    ...getDefaultMutationOptions({ operation: "Order status update" }),
  });
};

/**
 * Order Delete Hook
 * Cancels an order
 */
export const useDeleteOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId) => {
      const response = await apiClient.delete(`/dashboard/orders/${orderId}`);
      return response;
    },
    onSuccess: (data, variables) => {
      invalidateQueries.orders(queryClient);
      invalidateQueries.order(queryClient, variables);
      handleHookSuccess("ORDER_DELETED_SUCCESSFULLY");
    },
    ...getDefaultMutationOptions({ operation: "Order deletion" }),
  });
};

/**
 * Order Refund Hook
 * Processes full or partial refunds
 */
export const useProcessRefund = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, refundData }) => {
      const response = await apiClient.post(
        `/dashboard/orders/${orderId}/refund`,
        refundData
      );
      return response;
    },
    onSuccess: (data, variables) => {
      invalidateQueries.orders(queryClient);
      invalidateQueries.order(queryClient, variables.orderId);
      handleHookSuccess("REFUND_PROCESSED_SUCCESSFULLY");
    },
    ...getDefaultMutationOptions({ operation: "Refund processing" }),
  });
};

/**
 * Main Orders Management Hook
 * Provides a unified interface for all order management operations
 */
export const useOrdersManagement = () => {
  const ordersQuery = useOrders();
  const createOrderMutation = useCreateOrder();
  const editOrderMutation = useEditOrder();
  const updateOrderStatusMutation = useUpdateOrderStatus();
  const deleteOrderMutation = useDeleteOrder();
  const processRefundMutation = useProcessRefund();

  return {
    ...ordersQuery,
    createOrder: createOrderMutation,
    editOrder: editOrderMutation,
    updateOrderStatus: updateOrderStatusMutation,
    deleteOrder: deleteOrderMutation,
    processRefund: processRefundMutation,
  };
};
