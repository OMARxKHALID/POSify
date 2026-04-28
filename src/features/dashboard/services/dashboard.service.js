import { apiClient } from "@/lib/api-client";
import { transactionSchema } from "../schemas/transaction.schema";
import { analyticsSchema, transactionStatsSchema } from "../schemas/analytics.schema";
import { z } from "zod";
import { handleServiceError } from "@/lib/utils/error-handler";

export const dashboardService = {
  getAnalytics: async (timeRange) => {
    try {
      const response = await apiClient.get(`/dashboard/analytics?timeRange=${timeRange}`);
      return analyticsSchema.parse(response.data);
    } catch (error) {
      handleServiceError(error);
    }
  },

  getTransactions: async (filters = {}) => {
    try {
      const response = await apiClient.get("/dashboard/transactions", { params: filters });
      const transactions = response.data?.transactions || [];
      const validatedTransactions = z.array(transactionSchema).parse(transactions);
      return {
        ...response.data,
        transactions: validatedTransactions
      };
    } catch (error) {
      handleServiceError(error);
    }
  },

  getTransactionById: async (transactionId) => {
    try {
      const response = await apiClient.get(`/dashboard/transactions/${transactionId}`);
      return transactionSchema.parse(response.data);
    } catch (error) {
      handleServiceError(error);
    }
  },

  getTransactionStats: async () => {
    try {
      const response = await apiClient.get("/dashboard/transactions/stats");
      return transactionStatsSchema.parse(response.data);
    } catch (error) {
      handleServiceError(error);
    }
  },

  createTransaction: async (transactionData) => {
    try {
      const response = await apiClient.post("/dashboard/transactions/create", transactionData);
      return transactionSchema.parse(response.data);
    } catch (error) {
      handleServiceError(error);
    }
  }
};
