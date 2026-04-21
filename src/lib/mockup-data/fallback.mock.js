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
      ...data,
      organization: { _id: "demo_org", name: "Demo Restaurant" },
    };
  },

  categories: () => {
    const data = mockStore.getCategories();
    return {
      ...data,
      organization: { _id: "demo_org", name: "Demo Restaurant" },
    };
  },

  orders: () => {
    const data = mockStore.getOrders();
    return {
      ...data,
      pagination: {
        page: 1,
        limit: 20,
        total: data.orders.length,
        totalPages: 1,
      },
    };
  },

  transactions: () => {
    const data = mockStore.getTransactions();
    return {
      ...data,
      pagination: {
        page: 1,
        limit: 20,
        total: data.transactions.length,
        totalPages: 1,
      },
    };
  },

  analytics: (timeRange = "7d") => {
    return mockStore.getAnalytics(timeRange);
  },

  settings: () => {
    return mockStore.getSettings();
  },

  users: () => {
    const data = mockStore.getUsers();
    return {
      ...data,
      organization: { _id: "demo_org", name: "Demo Restaurant" },
    };
  },

  organization: () => ({
    _id: "demo_org",
    name: "Demo Restaurant",
    slug: "demo-restaurant",
    businessType: "restaurant",
    status: "active",
  }),

  auditLogs: () => {
    const data = mockStore.getAuditLogs();
    return {
      ...data,
      pagination: {
        page: 1,
        limit: 20,
        total: data.auditLogs.length,
        totalPages: 1,
      },
    };
  },
};

export default mockFallback;
