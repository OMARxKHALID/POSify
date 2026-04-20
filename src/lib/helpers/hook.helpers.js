import { toast } from "sonner";
import {
  getErrorMessage,
  getSuccessMessage,
} from "@/lib/helpers/error.helpers";
import { apiClient } from "@/lib/api-client";
import { isDataEmpty } from "@/lib/mockup-data";

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

    console.error("All session refresh attempts failed");
    return false;
  },

  async handleSessionRefresh(updateSession, responseData) {
    if (!responseData?.data?.sessionRefresh) return true;

    const refreshed = await sessionUtils.forceRefreshSession(updateSession);

    if (!refreshed) {
      console.warn("Session refresh failed, user may need to refresh the page");
    }

    return refreshed;
  },
};

export const createDemoQueryFn = (endpoint, fallbackFn, isDemoMode) => {
  return async () => {
    try {
      const data = await apiClient.get(endpoint);
      if (isDemoMode && isDataEmpty(data)) return fallbackFn();
      return data;
    } catch (error) {
      if (isDemoMode) {
        console.warn(`[Demo] ${endpoint} failed:`, error?.message ?? error);
        return fallbackFn();
      }
      throw error;
    }
  };
};
