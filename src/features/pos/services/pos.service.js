import { apiClient } from "@/lib/api-client";
import { orderSchema } from "../schemas/order.schema";
import { z } from "zod";

export const posService = {
  getAllOrders: async () => {
    const response = await apiClient.get("/dashboard/orders");
    const orders = response.data?.orders || [];
    const validatedOrders = z.array(orderSchema).parse(orders);
    return {
      ...response.data,
      orders: validatedOrders
    };
  },

  getOrderById: async (orderId) => {
    const response = await apiClient.get(`/dashboard/orders/${orderId}`);
    return orderSchema.parse(response.data);
  },

  createOrder: async (orderData) => {
    const response = await apiClient.post("/dashboard/orders/create", orderData);
    return orderSchema.parse(response.data);
  },

  updateOrder: async (orderId, orderData) => {
    const response = await apiClient.put(`/dashboard/orders/${orderId}`, orderData);
    return orderSchema.parse(response.data);
  },

  updateOrderStatus: async (orderId, status, notes) => {
    const response = await apiClient.put(`/dashboard/orders/${orderId}/status`, { 
      status, 
      notes 
    });
    return orderSchema.parse(response.data);
  },

  deleteOrder: async (orderId) => {
    const response = await apiClient.delete(`/dashboard/orders/${orderId}`);
    return orderSchema.parse(response.data);
  },

  processRefund: async (orderId, refundData) => {
    const response = await apiClient.post(`/dashboard/orders/${orderId}/refund`, refundData);
    return orderSchema.parse(response.data);
  }
};
