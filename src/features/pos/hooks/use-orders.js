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
import { posService } from "../services/pos.service";

export const useOrders = (options = {}) => {
  const { userId, isDemoMode } = useAppContext();

  return useQuery({
    queryKey: queryKeys.orders(userId),
    queryFn: createServiceQueryFn(
      posService.getAllOrders,
      () => mockFallback.orders(),
      isDemoMode,
    ),
    ...getDefaultQueryOptions(options),
  });
};

export const useOrder = (orderId, options = {}) => {
  const { userId, isDemoMode } = useAppContext();

  return useQuery({
    queryKey: queryKeys.order(orderId, userId),
    queryFn: createServiceQueryFn(
      () => posService.getOrderById(orderId),
      () => mockFallback.orders().orders.find(o => o._id === orderId) || mockFallback.orders().orders[0],
      isDemoMode,
    ),
    enabled: Boolean(orderId),
    ...getDefaultQueryOptions(options),
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["orders"],
    mutationFn: (orderData) => posService.createOrder(orderData),
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
    mutationFn: ({ orderId, orderData }) => posService.updateOrder(orderId, orderData),
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
    mutationFn: ({ orderId, status, notes }) => posService.updateOrderStatus(orderId, status, notes),
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
    mutationFn: (orderId) => posService.deleteOrder(orderId),
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
    mutationFn: ({ orderId, refundData }) => posService.processRefund(orderId, refundData),
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
