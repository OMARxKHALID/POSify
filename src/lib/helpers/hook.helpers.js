import { toast } from "sonner";
import {
  getErrorMessage,
  getSuccessMessage,
} from "@/lib/helpers/error.helpers";
import { apiClient } from "@/lib/api-client";

export const handleHookError = (error, operation = "operation") => {
  const statusCode = error?.statusCode ?? 0;
  if (statusCode >= 500) {
    console.error(`${operation} failed:`, error);
  }

  const errorMessage =
    getErrorMessage(error?.code) || error?.message || "Operation failed";

  toast.error(errorMessage);
  return errorMessage;
};

export const handleHookSuccess = (messageOrCode) => {
  const message = getSuccessMessage(messageOrCode) || "Operation successful";
  toast.success(message);
};

export const getDefaultQueryOptions = (customOptions = {}) => ({
  staleTime: 5 * 60 * 1000,
  retry: 2,
  refetchOnWindowFocus: false,
  ...customOptions,
});

export const getDefaultMutationOptions = ({
  operation,
  ...customOptions
} = {}) => ({
  onError: (error) => handleHookError(error, operation || "Operation"),
  ...customOptions,
});

export const queryKeys = {
  users: () => ["users"],
  user: (id) => ["users", id],
  analytics: (timeRange) => ["analytics", timeRange],
  auditLogs: (filters) => ["audit-logs", filters],
  organization: () => ["organization", "overview"],
  availableStaff: (organizationId) => [
    "organization",
    "available-staff",
    organizationId,
  ],
  superAdmin: () => ["super-admin"],
  organizations: () => ["organizations"],
  menu: () => ["menu"],
  menuItem: (id) => ["menu", id],
  categories: () => ["categories"],
  category: (id) => ["categories", id],
  orders: () => ["orders"],
  order: (id) => ["orders", id],
  transactions: () => ["transactions"],
  transaction: (id) => ["transactions", id],
  transactionStats: () => ["transactions", "stats"],
  settings: () => ["settings"],
};

const invalidateQuery = (queryClient, queryKey) => {
  queryClient.invalidateQueries({ queryKey });
};

export const invalidateQueries = Object.fromEntries(
  Object.entries(queryKeys).map(([key, value]) => [
    key,
    typeof value === "function"
      ? (queryClient, ...args) => invalidateQuery(queryClient, value(...args))
      : (queryClient) => invalidateQuery(queryClient, value),
  ]),
);

export const sessionUtils = {
  async forceRefreshSession(
    updateSession,
    options = { maxRetries: 2, delay: 150 },
  ) {
    const { maxRetries, delay } = options;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await updateSession();
        return true;
      } catch (error) {
        console.error(`Session refresh attempt ${attempt} failed:`, error);
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    return false;
  },

  async handleSessionRefresh(updateSession, responseData) {
    if (!responseData?.data?.sessionRefresh) return true;
    return await sessionUtils.forceRefreshSession(updateSession);
  },
};

export const createServiceQueryFn = (serviceFn, fallbackFn, isDemoMode) => {
  return async () => {
    if (isDemoMode) {
      try {
        const data = await serviceFn();
        if (data !== null && data !== undefined) return data;
        return fallbackFn();
      } catch (error) {
        console.warn("[Demo Mode] Service failed, using fallback:", error.message);
        return fallbackFn();
      }
    }
    return await serviceFn();
  };
};
