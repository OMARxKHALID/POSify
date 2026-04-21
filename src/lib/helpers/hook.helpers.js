import { toast } from "sonner";
import { z } from "zod";
import {
  getErrorMessage,
  getSuccessMessage,
} from "@/lib/helpers/error.helpers";

const formatZodError = (error) => {
  if (error instanceof z.ZodError) {
    const firstError = error.errors?.[0];
    if (firstError) {
      return `${firstError.path.join(".")}: ${firstError.message}`;
    }
    return "Validation failed";
  }
  return null;
};

export const handleHookError = (error, operation = "operation") => {
  const statusCode = error?.statusCode ?? 0;
  if (statusCode >= 500) {
    console.error(`${operation} failed:`, error);
  }

  const zodMessage = formatZodError(error);
  const errorMessage =
    getErrorMessage(error?.code) ||
    zodMessage ||
    error?.message ||
    "Operation failed";

  toast.error(errorMessage);
  return errorMessage;
};

export const handleHookSuccess = (messageOrCode) => {
  const message = getSuccessMessage(messageOrCode) || "Operation successful";
  toast.success(message);
};

export const getDefaultQueryOptions = (customOptions = {}) => ({
  staleTime: 3 * 60 * 1000,
  retry: 2,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  suspense: true,
  ...customOptions,
});

const serializeFilters = (filters) => {
  if (!filters || typeof filters !== "object") return "default";
  const entries = Object.entries(filters).sort(([a], [b]) => a.localeCompare(b));
  return entries.map(([k, v]) => `${k}=${v}`).join("&");
};

export const getDefaultMutationOptions = ({
  operation,
  ...customOptions
} = {}) => ({
  onError: (error) => handleHookError(error, operation || "Operation"),
  ...customOptions,
});

const BASE_KEYS = {
  users: (userId) => ["users", userId],
  user: (id, userId) => ["users", id, userId],
  analytics: (timeRange, userId) => ["analytics", timeRange, userId],
  auditLogs: (filters, userId) => ["audit-logs", filters, userId],
  organization: (userId) => ["organization", "overview", userId],
  availableStaff: (organizationId, userId) => [
    "organization",
    "available-staff",
    organizationId,
    userId,
  ],
  superAdmin: (userId) => ["super-admin", userId],
  organizations: (userId) => ["organizations", userId],
  menu: (userId) => ["menu", userId],
  menuItem: (id, userId) => ["menu", id, userId],
  categories: (userId) => ["categories", userId],
  category: (id, userId) => ["categories", id, userId],
  orders: (userId) => ["orders", userId],
  order: (id, userId) => ["orders", id, userId],
  transactions: (userId) => ["transactions", userId],
  transaction: (id, userId) => ["transactions", id, userId],
  transactionStats: (userId) => ["transactions", "stats", userId],
  settings: (userId) => ["settings", userId],
  transactionsFiltered: (filters, userId) => ["transactions", "filtered", serializeFilters(filters), userId],
};

export const queryKeys = {
  ...BASE_KEYS,
  users: (userId = "default") => BASE_KEYS.users(userId),
  user: (id, userId = "default") => BASE_KEYS.user(id, userId),
  analytics: (timeRange = "30d", userId = "default") => BASE_KEYS.analytics(timeRange, userId),
  auditLogs: (filters = {}, userId = "default") => BASE_KEYS.auditLogs(filters, userId),
  organization: (userId = "default") => BASE_KEYS.organization(userId),
  availableStaff: (organizationId, userId = "default") => BASE_KEYS.availableStaff(organizationId, userId),
  superAdmin: (userId = "default") => BASE_KEYS.superAdmin(userId),
  organizations: (userId = "default") => BASE_KEYS.organizations(userId),
  menu: (userId = "default") => BASE_KEYS.menu(userId),
  menuItem: (id, userId = "default") => BASE_KEYS.menuItem(id, userId),
  categories: (userId = "default") => BASE_KEYS.categories(userId),
  category: (id, userId = "default") => BASE_KEYS.category(id, userId),
  orders: (userId = "default") => BASE_KEYS.orders(userId),
  order: (id, userId = "default") => BASE_KEYS.order(id, userId),
  transactions: (userId = "default") => BASE_KEYS.transactions(userId),
  transaction: (id, userId = "default") => BASE_KEYS.transaction(id, userId),
  transactionStats: (userId = "default") => BASE_KEYS.transactionStats(userId),
  settings: (userId = "default") => BASE_KEYS.settings(userId),
  transactionsFiltered: (filters = {}, userId = "default") => BASE_KEYS.transactionsFiltered(filters, userId),
};

const invalidateQuery = (queryClient, queryKey) => {
  queryClient.invalidateQueries({ queryKey: queryKey });
};

export const invalidateQueries = {
  users: (queryClient, userId = "default") => invalidateQuery(queryClient, queryKeys.users(userId)),
  user: (queryClient, id, userId = "default") => invalidateQuery(queryClient, queryKeys.user(id, userId)),
  analytics: (queryClient, timeRange = "30d", userId = "default") => invalidateQuery(queryClient, queryKeys.analytics(timeRange, userId)),
  auditLogs: (queryClient, filters = {}, userId = "default") => invalidateQuery(queryClient, queryKeys.auditLogs(filters, userId)),
  organization: (queryClient, userId = "default") => invalidateQuery(queryClient, queryKeys.organization(userId)),
  availableStaff: (queryClient, organizationId, userId = "default") => invalidateQuery(queryClient, queryKeys.availableStaff(organizationId, userId)),
  superAdmin: (queryClient, userId = "default") => invalidateQuery(queryClient, queryKeys.superAdmin(userId)),
  organizations: (queryClient, userId = "default") => invalidateQuery(queryClient, queryKeys.organizations(userId)),
  menu: (queryClient, userId = "default") => invalidateQuery(queryClient, queryKeys.menu(userId)),
  menuItem: (queryClient, id, userId = "default") => invalidateQuery(queryClient, queryKeys.menuItem(id, userId)),
  categories: (queryClient, userId = "default") => invalidateQuery(queryClient, queryKeys.categories(userId)),
  category: (queryClient, id, userId = "default") => invalidateQuery(queryClient, queryKeys.category(id, userId)),
  orders: (queryClient, userId = "default") => invalidateQuery(queryClient, queryKeys.orders(userId)),
  order: (queryClient, id, userId = "default") => invalidateQuery(queryClient, queryKeys.order(id, userId)),
  transactions: (queryClient, userId = "default") => invalidateQuery(queryClient, queryKeys.transactions(userId)),
  transaction: (queryClient, id, userId = "default") => invalidateQuery(queryClient, queryKeys.transaction(id, userId)),
  transactionStats: (queryClient, userId = "default") => invalidateQuery(queryClient, queryKeys.transactionStats(userId)),
  settings: (queryClient, userId = "default") => invalidateQuery(queryClient, queryKeys.settings(userId)),
  transactionsFiltered: (queryClient, filters = {}, userId = "default") => invalidateQuery(queryClient, queryKeys.transactionsFiltered(filters, userId)),
};

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
      return fallbackFn();
    }
    try {
      const data = await serviceFn();
      if (data !== null && data !== undefined) return data;
      return fallbackFn();
    } catch (error) {
      console.warn("[API Error] Service failed, using fallback:", error.message);
      return fallbackFn();
    }
  };
};
