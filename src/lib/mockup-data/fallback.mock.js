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

import { z } from "zod";
import { menuSchema } from "@/features/menu/schemas/menu.schema";
import { categorySchema } from "@/features/menu/schemas/category.schema";
import { orderSchema } from "@/features/pos/schemas/order.schema";
import { transactionSchema } from "@/features/dashboard/schemas/transaction.schema";
import { transactionStatsSchema, analyticsSchema } from "@/features/dashboard/schemas/analytics.schema";
import { settingsSchema } from "@/features/settings/schemas/settings.schema";
import { userSchema } from "@/features/users/schemas/user.schema";
import { organizationSchema } from "@/features/organization/schemas/organization.schema";
import { auditLogsResponseSchema } from "@/features/audit/schemas/audit.schema";

export const mockFallback = {
  menu: () => {
    const data = mockStore.getMenu();
    return {
      menuItems: z.array(menuSchema).safeParse(data.menuItems).data || [],
      categories: z.array(categorySchema).safeParse(data.categories).data || [],
      organization: organizationSchema.safeParse({ _id: "demo_org", name: "Demo Restaurant" }).data,
    };
  },

  categories: () => {
    const data = mockStore.getCategories();
    return {
      categories: z.array(categorySchema).safeParse(data.categories).data || [],
      organization: organizationSchema.safeParse({ _id: "demo_org", name: "Demo Restaurant" }).data,
    };
  },

  orders: () => {
    const data = mockStore.getOrders();
    return {
      orders: z.array(orderSchema).safeParse(data.orders).data || [],
    };
  },

  transactions: () => {
    const data = mockStore.getTransactions();
    return {
      transactions: z.array(transactionSchema).safeParse(data.transactions).data || [],
      ...(data.stats && { stats: transactionStatsSchema.safeParse(data.stats).data }),
    };
  },

  analytics: (timeRange = "7d") => {
    const data = mockStore.getAnalytics(timeRange);
    return analyticsSchema.safeParse(data).data || data;
  },

  settings: () => {
    const data = mockStore.getSettings();
    return {
      ...settingsSchema.safeParse(data.settings).data,
      organization: organizationSchema.safeParse(data.organization).data,
      currentUser: userSchema.safeParse(data.currentUser).data,
    };
  },

  users: () => {
    const data = mockStore.getUsers();
    return {
      users: z.array(userSchema).safeParse(data.users).data || [],
      organization: organizationSchema.safeParse({ _id: "demo_org", name: "Demo Restaurant" }).data,
    };
  },

  organization: () => {
    return organizationSchema.safeParse({
      _id: "demo_org",
      name: "Demo Restaurant",
      slug: "demo-restaurant",
      businessType: "restaurant",
      status: "active",
    }).data;
  },

  auditLogs: () => {
    const data = mockStore.getAuditLogs();
    const payload = {
      auditLogs: data.auditLogs,
      pagination: {
        page: 1,
        limit: 20,
        total: data.auditLogs.length,
        totalPages: 1,
      },
    };
    return auditLogsResponseSchema.safeParse(payload).data || payload;
  },
};

export default mockFallback;
