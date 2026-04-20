import { mockMenuItems } from "./menu.mock";
import { mockCategories } from "./categories.mock";
import { mockOrders, mockOrderStats } from "./orders.mock";
import { mockTransactions, mockTransactionStats } from "./transactions.mock";
import { mockAnalytics } from "./analytics.mock";
import { mockSettings } from "./settings.mock";
import { mockAuditLogs } from "./audit-logs.mock";

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
    const menuWithCategories = mockMenuItems.map((item) => ({
      ...item,
      categoryId: item.categoryId,
      category: { name: item.categoryName },
    }));
    return {
      success: true,
      code: "MENU_RETRIEVED_SUCCESSFULLY",
      data: {
        menuItems: menuWithCategories,
        categories: mockCategories.filter((c) => c.isActive),
        organization: { _id: "demo_org", name: "Demo Restaurant" },
      },
      isDemo: true,
    };
  },

  categories: () => ({
    success: true,
    code: "CATEGORIES_RETRIEVED_SUCCESSFULLY",
    data: {
      categories: mockCategories,
      organization: { _id: "demo_org", name: "Demo Restaurant" },
    },
    isDemo: true,
  }),

  orders: () => ({
    success: true,
    code: "ORDERS_RETRIEVED_SUCCESSFULLY",
    data: {
      orders: mockOrders,
      stats: mockOrderStats,
      pagination: {
        page: 1,
        limit: 20,
        total: mockOrders.length,
        totalPages: 1,
      },
    },
    isDemo: true,
  }),

  transactions: () => ({
    success: true,
    code: "TRANSACTIONS_RETRIEVED_SUCCESSFULLY",
    data: {
      transactions: mockTransactions,
      stats: mockTransactionStats,
      pagination: {
        page: 1,
        limit: 20,
        total: mockTransactions.length,
        totalPages: 1,
      },
    },
    isDemo: true,
  }),

  analytics: (timeRange = "7d") => {
    const rangeMap = {
      "7d": 7,
      "30d": 30,
      "90d": 90,
    };
    const days = rangeMap[timeRange] || 7;

    return {
      success: true,
      code: "ANALYTICS_RETRIEVED_SUCCESSFULLY",
      data: {
        sales: mockAnalytics.sales,
        performance: mockAnalytics.performance,
        inventory: mockAnalytics.inventory,
        timeRange: timeRange,
        period: `${days} days`,
      },
      isDemo: true,
    };
  },

  settings: () => ({
    success: true,
    code: "SETTINGS_RETRIEVED_SUCCESSFULLY",
    data: {
      settings: mockSettings,
      organization: { _id: "demo_org", name: "Demo Restaurant", owner: "demo_user_001" },
      currentUser: { _id: "demo_user_001", role: "admin", name: "Demo Admin" },
    },
    isDemo: true,
  }),

  users: () => ({
    success: true,
    code: "USERS_RETRIEVED_SUCCESSFULLY",
    data: {
      users: [
        {
          _id: "demo_user_001",
          name: "Admin User",
          email: "admin@demo.com",
          role: "admin",
          status: "active",
          permissions: [],
          lastLogin: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          emailVerified: true,
          organizationId: "demo_org",
          createdAt: new Date(
            Date.now() - 1000 * 60 * 60 * 24 * 30,
          ).toISOString(),
        },
        {
          _id: "demo_user_002",
          name: "Jane Staff",
          email: "staff@demo.com",
          role: "staff",
          status: "active",
          permissions: [],
          lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          emailVerified: true,
          organizationId: "demo_org",
          createdAt: new Date(
            Date.now() - 1000 * 60 * 60 * 24 * 14,
          ).toISOString(),
        },
        {
          _id: "demo_user_003",
          name: "Bob Pending",
          email: "pending@demo.com",
          role: "pending",
          status: "inactive",
          permissions: [],
          lastLogin: null,
          emailVerified: false,
          organizationId: "demo_org",
          createdAt: new Date(
            Date.now() - 1000 * 60 * 60 * 24 * 2,
          ).toISOString(),
        },
      ],
      organization: { _id: "demo_org", name: "Demo Restaurant" },
    },
    isDemo: true,
  }),

  organization: () => ({
    success: true,
    code: "ORGANIZATION_RETRIEVED_SUCCESSFULLY",
    data: {
      _id: "demo_org",
      name: "Demo Restaurant",
      slug: "demo-restaurant",
      businessType: "restaurant",
      status: "active",
      onboardingCompleted: true,
      information: {
        legalName: "Demo Restaurant LLC",
        displayName: "Demo Restaurant",
        orgPhone: "+1 (555) 123-4567",
        orgEmail: "contact@demorestaurant.com",
        address: {
          street: "123 Foodie Ave",
          city: "Gastro City",
          state: "NY",
          postalCode: "10001",
          country: "USA",
        },
        currency: "USD",
        timezone: "America/New_York",
      },
    },
    isDemo: true,
  }),

  auditLogs: () => ({
    success: true,
    code: "AUDIT_LOGS_RETRIEVED_SUCCESSFULLY",
    data: {
      auditLogs: mockAuditLogs,
      pagination: {
        page: 1,
        limit: 20,
        total: mockAuditLogs.length,
        totalPages: 1,
      },
    },
    isDemo: true,
  }),
};

export default mockFallback;
