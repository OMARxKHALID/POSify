import { toast } from "sonner";
import {
  getErrorMessage,
  getSuccessMessage,
} from "@/lib/helpers/error-helpers";

// Handle error in hooks and display a toast message
export const handleHookError = (error, operation = "operation") => {
  const isServerError = error.statusCode >= 500;

  // Only log server errors (5xx) to console, not business logic errors (4xx)
  if (isServerError) {
    console.error(`${operation} failed:`, error);
  }

  // Get user-friendly error message based on error code
  const errorMessage =
    getErrorMessage(error.code) || error.message || "Operation failed";

  toast.error(errorMessage);
  return errorMessage;
};

// Handle success in hooks and display a success toast message
export const handleHookSuccess = (messageOrCode) => {
  // If it's a success code, get the user-friendly message
  const message = getSuccessMessage(messageOrCode);
  toast.success(message);
};

// Default query options for consistent query behavior
export const getDefaultQueryOptions = (customOptions = {}) => ({
  staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
  retry: 2, // Retry failed queries twice
  refetchOnWindowFocus: false, // Prevent refetch on window focus
  ...customOptions,
});

// Default mutation options with custom error handler
export const getDefaultMutationOptions = (customOptions = {}) => ({
  onError: (error) =>
    handleHookError(error, customOptions.operation || "Operation"),
  ...customOptions,
});

// Factory for consistent query keys
export const queryKeys = {
  users: ["users"], // Users query key
  user: (id) => ["users", id], // Single user query key
  analytics: (timeRange) => ["analytics", timeRange], // Analytics query key
  auditLogs: (filters) => ["audit-logs", filters], // Audit logs query key
  organization: ["organization", "overview"], // Organization overview query key
  availableStaff: (organizationId) => [
    "organization",
    "available-staff",
    organizationId,
  ], // Available staff query key
  superAdmin: ["super-admin"], // Super admin query key
  organizations: ["organizations"], // Organizations query key
  menu: ["menu"], // Menu items query key
  menuItem: (id) => ["menu", id], // Single menu item query key
  categories: ["categories"], // Categories query key
  category: (id) => ["categories", id], // Single category query key
  orders: () => ["orders"], // Orders query key
  order: (id) => ["orders", id], // Single order query key
  transactions: () => ["transactions"], // Transactions query key
  transaction: (id) => ["transactions", id], // Single transaction query key
  transactionStats: () => ["transactions", "stats"], // Transaction stats query key
  settings: () => ["settings"], // Settings query key
};

// Generalized function to invalidate queries
const invalidateQuery = (queryClient, queryKey) => {
  queryClient.invalidateQueries({ queryKey });
};

// Common query invalidation patterns
export const invalidateQueries = {
  users: (queryClient) => invalidateQuery(queryClient, queryKeys.users),
  user: (queryClient, userId) =>
    invalidateQuery(queryClient, queryKeys.user(userId)),
  analytics: (queryClient) =>
    invalidateQuery(queryClient, queryKeys.analytics("default")),
  auditLogs: (queryClient) =>
    invalidateQuery(queryClient, queryKeys.auditLogs({})),
  organization: (queryClient) =>
    invalidateQuery(queryClient, queryKeys.organization),
  availableStaff: (queryClient, organizationId) =>
    invalidateQuery(queryClient, queryKeys.availableStaff(organizationId)),
  superAdmin: (queryClient) =>
    invalidateQuery(queryClient, queryKeys.superAdmin),
  organizations: (queryClient) =>
    invalidateQuery(queryClient, queryKeys.organizations),
  menu: (queryClient) => invalidateQuery(queryClient, queryKeys.menu),
  menuItem: (queryClient, menuItemId) =>
    invalidateQuery(queryClient, queryKeys.menuItem(menuItemId)),
  categories: (queryClient) =>
    invalidateQuery(queryClient, queryKeys.categories),
  category: (queryClient, categoryId) =>
    invalidateQuery(queryClient, queryKeys.category(categoryId)),
  orders: (queryClient) => invalidateQuery(queryClient, queryKeys.orders()),
  order: (queryClient, orderId) =>
    invalidateQuery(queryClient, queryKeys.order(orderId)),
  transactions: (queryClient) =>
    invalidateQuery(queryClient, queryKeys.transactions()),
  transaction: (queryClient, transactionId) =>
    invalidateQuery(queryClient, queryKeys.transaction(transactionId)),
  transactionStats: (queryClient) =>
    invalidateQuery(queryClient, queryKeys.transactionStats()),
  settings: (queryClient) => invalidateQuery(queryClient, queryKeys.settings()),
};

// Utilities for session management, including session refresh
export const sessionUtils = {
  // Force session refresh with retry logic
  async forceRefreshSession(
    updateSession,
    options = { maxRetries: 2, delay: 150 }
  ) {
    const { maxRetries, delay } = options;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (attempt === 1) {
          await new Promise((resolve) => setTimeout(resolve, 100)); // Small delay before first attempt
        }

        await updateSession();
        return true;
      } catch (error) {
        console.error(`Session refresh attempt ${attempt} failed:`, error);

        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, delay)); // Retry after delay
        }
      }
    }

    console.error("All session refresh attempts failed");
    return false;
  },

  // Handle session refresh after a data mutation
  async handleSessionRefresh(updateSession, responseData) {
    if (!responseData?.data?.sessionRefresh) {
      return true;
    }

    const success = await sessionUtils.forceRefreshSession(updateSession);

    if (!success) {
      console.warn("Session refresh failed, user may need to refresh the page");
    }

    return success;
  },
};
