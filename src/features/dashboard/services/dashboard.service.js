import { apiClient } from "@/lib/api-client";
import { transactionSchema } from "../schemas/transaction.schema";
import { z } from "zod";

export const dashboardService = {
  getAnalytics: async (timeRange) => {
    const response = await apiClient.get(`/dashboard/analytics?timeRange=${timeRange}`);
    return response.data;
  },

  getTransactions: async (filters = {}) => {
    const response = await apiClient.get("/dashboard/transactions", { params: filters });
    const transactions = response.data?.transactions || [];
    const validatedTransactions = z.array(transactionSchema).parse(transactions);
    return {
      ...response.data,
      transactions: validatedTransactions
    };
  },

  getTransactionById: async (transactionId) => {
    const response = await apiClient.get(`/dashboard/transactions/${transactionId}`);
    return transactionSchema.parse(response.data);
  },

  getTransactionStats: async () => {
    const response = await apiClient.get("/dashboard/transactions/stats");
    return response.data;
  },

  createTransaction: async (transactionData) => {
    const response = await apiClient.post("/dashboard/transactions/create", transactionData);
    return transactionSchema.parse(response.data);
  }
};
