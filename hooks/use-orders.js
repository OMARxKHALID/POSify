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

export const useOrders = (options = {}) => {
  const { data: session } = useSession();
  const isDemoMode = useIsDemoModeEnabled();

  return useQuery({
    queryKey: [...queryKeys.orders(), session?.user?.id],
    queryFn: createDemoQueryFn(
      "/dashboard/orders",
      () => mockFallback.orders().data,
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

export const useOrder = (orderId, options = {}) => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: [...queryKeys.order(orderId), session?.user?.id],
    queryFn: () => apiClient.get(`/dashboard/orders/${orderId}`),
    enabled: Boolean(orderId),
    ...getDefaultQueryOptions({
      staleTime: 2 * 60 * 1000,
      ...options,
    }),
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["orders"],
    mutationFn: (orderData) =>
      apiClient.post("/dashboard/orders/create", orderData),
    onSuccess: () => {
      invalidateQueries.orders(queryClient);
      invalidateQueries.transactions(queryClient);
      invalidateQueries.transactionStats(queryClient);
      handleHookSuccess("ORDER_CREATED_SUCCESSFULLY");
    },
    ...getDefaultMutationOptions({ operation: "Order creation" }),
  });
};

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

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status, notes }) =>
      apiClient.put(`/dashboard/orders/${orderId}/status`, { status, notes }),
    onSuccess: (_, variables) => {
      invalidateQueries.orders(queryClient);
      invalidateQueries.order(queryClient, variables.orderId);
      invalidateQueries.transactions(queryClient);
      invalidateQueries.transactionStats(queryClient);
      handleHookSuccess("ORDER_STATUS_UPDATED_SUCCESSFULLY");
    },
    ...getDefaultMutationOptions({ operation: "Order status update" }),
  });
};

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
