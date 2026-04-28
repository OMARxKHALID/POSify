import { apiClient } from "@/lib/api-client";
import { orderSchema } from "../schemas/order.schema";
import { z } from "zod";
import { handleServiceError } from "@/lib/utils/error-handler";

export const posService = {
  getAllOrders: async () => {
    try {
      const response = await apiClient.get("/dashboard/orders");
      const orders = response.data?.orders || [];
      const validatedOrders = z.array(orderSchema).parse(orders);
      return {
        ...response.data,
        orders: validatedOrders
      };
    } catch (error) {
      handleServiceError(error);
    }
  },

  getOrderById: async (orderId) => {
    try {
      const response = await apiClient.get(`/dashboard/orders/${orderId}`);
      return orderSchema.parse(response.data);
    } catch (error) {
      handleServiceError(error);
    }
  },

  createOrder: async (orderData) => {
    try {
      const response = await apiClient.post("/dashboard/orders/create", orderData);
      return orderSchema.parse(response.data);
    } catch (error) {
      handleServiceError(error);
    }
  },

  updateOrder: async (orderId, orderData) => {
    try {
      const response = await apiClient.put(`/dashboard/orders/${orderId}`, orderData);
      return orderSchema.parse(response.data);
    } catch (error) {
      handleServiceError(error);
    }
  },

  updateOrderStatus: async (orderId, status, notes) => {
    try {
      const response = await apiClient.put(`/dashboard/orders/${orderId}/status`, { 
        status, 
        notes 
      });
      return orderSchema.parse(response.data);
    } catch (error) {
      handleServiceError(error);
    }
  },

  deleteOrder: async (orderId) => {
    try {
      const response = await apiClient.delete(`/dashboard/orders/${orderId}`);
      return orderSchema.parse(response.data);
    } catch (error) {
      handleServiceError(error);
    }
  },

  processRefund: async (orderId, refundData) => {
    try {
      const response = await apiClient.post(`/dashboard/orders/${orderId}/refund`, refundData);
      return orderSchema.parse(response.data);
    } catch (error) {
      handleServiceError(error);
    }
  }
};
