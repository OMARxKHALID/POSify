import { mockStore } from "./mock-store";

export const isDataEmpty = (data) => {
  if (data === null || data === undefined) return true;
  if (Array.isArray(data) && data.length === 0) return true;
  if (typeof data === "object") {
    const keys = Object.keys(data);
    if (keys.length === 0) return true;

    const arrayPropsToCheck = [
      "menuItems",
      "categories",
      "orders",
      "transactions",
      "users",
      "auditLogs",
    ];
    for (const prop of arrayPropsToCheck) {
      if (Array.isArray(data[prop]) && data[prop].length === 0) return true;
    }
  }
  return false;
};

export const mockFallback = {
  menu: () => {
    const data = mockStore.getMenu();
    return {
      success: true,
      code: "MENU_RETRIEVED_SUCCESSFULLY",
      data: {
        ...data,
        organization: { _id: "demo_org", name: "Demo Restaurant" },
      },
      isDemo: true,
    };
  },

  categories: () => {
    const data = mockStore.getCategories();
    return {
      success: true,
      code: "CATEGORIES_RETRIEVED_SUCCESSFULLY",
      data: {
        ...data,
        organization: { _id: "demo_org", name: "Demo Restaurant" },
      },
      isDemo: true,
    };
  },

  orders: () => {
    const data = mockStore.getOrders();
    return {
      success: true,
      code: "ORDERS_RETRIEVED_SUCCESSFULLY",
      data: {
        ...data,
        pagination: {
          page: 1,
          limit: 20,
          total: data.orders.length,
          totalPages: 1,
        },
      },
      isDemo: true,
    };
  },

  transactions: () => {
    const data = mockStore.getTransactions();
    return {
      success: true,
      code: "TRANSACTIONS_RETRIEVED_SUCCESSFULLY",
      data: {
        ...data,
        pagination: {
          page: 1,
          limit: 20,
          total: data.transactions.length,
          totalPages: 1,
        },
      },
      isDemo: true,
    };
  },

  analytics: (timeRange = "7d") => {
    const data = mockStore.getAnalytics(timeRange);
    return {
      success: true,
      code: "ANALYTICS_RETRIEVED_SUCCESSFULLY",
      data,
      isDemo: true,
    };
  },

  settings: () => {
    const data = mockStore.getSettings();
    return {
      success: true,
      code: "SETTINGS_RETRIEVED_SUCCESSFULLY",
      data,
      isDemo: true,
    };
  },

  users: () => {
    const data = mockStore.getUsers();
    return {
      success: true,
      code: "USERS_RETRIEVED_SUCCESSFULLY",
      data: {
        ...data,
        organization: { _id: "demo_org", name: "Demo Restaurant" },
      },
      isDemo: true,
    };
  },

  organization: () => ({
    success: true,
    code: "ORGANIZATION_RETRIEVED_SUCCESSFULLY",
    data: {
      _id: "demo_org",
      name: "Demo Restaurant",
      slug: "demo-restaurant",
      businessType: "restaurant",
      status: "active",
    },
    isDemo: true,
  }),

  auditLogs: () => {
    const data = mockStore.getAuditLogs();
    return {
      success: true,
      code: "AUDIT_LOGS_RETRIEVED_SUCCESSFULLY",
      data: {
        ...data,
        pagination: {
          page: 1,
          limit: 20,
          total: data.auditLogs.length,
          totalPages: 1,
        },
      },
      isDemo: true,
    };
  },
};

export default mockFallback;
