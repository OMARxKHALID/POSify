import { toast } from "sonner";
import {
  getErrorMessage,
  getSuccessMessage,
} from "@/lib/helpers/error-helpers";
import { useDemoModeStore } from "@/lib/store/use-demo-mode-store";

export const isDemoModeEnabled = () => {
  if (typeof window === "undefined") return true;
  try {
    return useDemoModeStore.getState().isDemoMode !== false;
  } catch {
    return true;
  }
};

export const handleHookError = (error, operation = "operation") => {
  const isServerError = error.statusCode >= 500;

  if (isServerError) {
    console.error(`${operation} failed:`, error);
  }

  const errorMessage =
    getErrorMessage(error.code) || error.message || "Operation failed";

  toast.error(errorMessage);
  return errorMessage;
};

export const handleHookSuccess = (messageOrCode) => {
  const message = getSuccessMessage(messageOrCode);
  toast.success(message);
};

export const getDefaultQueryOptions = (customOptions = {}) => ({
  staleTime: 5 * 60 * 1000,
  retry: 2,
  refetchOnWindowFocus: false,
  ...customOptions,
});

export const getDefaultMutationOptions = (customOptions = {}) => ({
  onError: (error) =>
    handleHookError(error, customOptions.operation || "Operation"),
  ...customOptions,
});

export const queryKeys = {
  users: ["users"],
  user: (id) => ["users", id],
  analytics: (timeRange) => ["analytics", timeRange],
  auditLogs: (filters) => ["audit-logs", filters],
  organization: ["organization", "overview"],
  availableStaff: (organizationId) => [
    "organization",
    "available-staff",
    organizationId,
  ],
  superAdmin: ["super-admin"],
  organizations: ["organizations"],
  menu: ["menu"],
  menuItem: (id) => ["menu", id],
  categories: ["categories"],
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

export const sessionUtils = {
  async forceRefreshSession(
    updateSession,
    options = { maxRetries: 2, delay: 150 },
  ) {
    const { maxRetries, delay } = options;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (attempt === 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

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
