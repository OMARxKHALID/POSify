import { mockMenuItems } from "./menu.mock";
import { mockCategories } from "./categories.mock";
import { mockOrders, mockOrderStats } from "./orders.mock";
import { mockTransactions, mockTransactionStats } from "./transactions.mock";
import { mockAnalytics } from "./analytics.mock";
import { mockSettings } from "./settings.mock";
import { mockAuditLogs } from "./audit-logs.mock";

const ensureCreatedAt = (item, daysAgo = 30) => ({
  ...item,
  createdAt: item.createdAt || new Date(Date.now() - 1000 * 60 * 60 * 24 * daysAgo).toISOString(),
});

let store = {
  menuItems: mockMenuItems.map((item, i) => ensureCreatedAt(item, 30 - i)),
  categories: mockCategories.map((item, i) => ensureCreatedAt(item, 20 - i)),
  orders: mockOrders.map((item, i) => ensureCreatedAt(item, 7 - i)),
  orderStats: { ...mockOrderStats },
  transactions: mockTransactions.map((item, i) => ensureCreatedAt(item, 5 - i)),
  transactionStats: { ...mockTransactionStats },
  analytics: { ...mockAnalytics },
  settings: { ...mockSettings },
  auditLogs: mockAuditLogs.map((item, i) => ensureCreatedAt(item, 14 - i)),
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
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
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
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
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
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    },
  ],
};

export const mockStore = {
  getMenu: () => ({
    menuItems: store.menuItems,
    categories: store.categories.filter((c) => c.isActive),
  }),

  getCategories: () => ({
    categories: store.categories,
  }),

  getOrders: () => ({
    orders: store.orders,
    stats: store.orderStats,
  }),

  getTransactions: () => ({
    transactions: store.transactions,
    stats: store.transactionStats,
  }),

  getAnalytics: (timeRange) => {
    const rangeMap = { "7d": 7, "30d": 30, "90d": 90 };
    const days = rangeMap[timeRange] || 7;
    return {
      sales: store.analytics.sales,
      performance: store.analytics.performance,
      inventory: store.analytics.inventory,
      timeRange,
      period: `${days} days`,
    };
  },

  getSettings: () => ({
    settings: store.settings,
    organization: { _id: "demo_org", name: "Demo Restaurant", owner: "demo_user_001" },
    currentUser: { _id: "demo_user_001", role: "admin", name: "Demo Admin" },
  }),

  getOrganization: () => ({
    _id: "demo_org",
    name: "Demo Restaurant",
    owner: "demo_user_001",
    businessType: "restaurant",
    status: "active",
  }),

  getUsers: () => ({
    users: store.users,
  }),

  getAuditLogs: () => ({
    auditLogs: store.auditLogs,
  }),

  addMenuItem: (item) => {
    const newItem = { ...item, _id: `menu_${Date.now()}`, createdAt: new Date().toISOString() };
    store.menuItems = [newItem, ...store.menuItems];
    return newItem;
  },

  updateMenuItem: (id, data) => {
    const index = store.menuItems.findIndex((item) => item._id === id);
    if (index !== -1) {
      store.menuItems[index] = { ...store.menuItems[index], ...data };
      return store.menuItems[index];
    }
    return null;
  },

  deleteMenuItem: (id) => {
    store.menuItems = store.menuItems.filter((item) => item._id !== id);
    return true;
  },

  addCategory: (category) => {
    const newCategory = { ...category, _id: `cat_${Date.now()}`, createdAt: new Date().toISOString() };
    store.categories = [newCategory, ...store.categories];
    return newCategory;
  },

  updateCategory: (id, data) => {
    const index = store.categories.findIndex((c) => c._id === id);
    if (index !== -1) {
      store.categories[index] = { ...store.categories[index], ...data };
      return store.categories[index];
    }
    return null;
  },

  deleteCategory: (id) => {
    store.categories = store.categories.filter((c) => c._id !== id);
    return true;
  },

  addOrder: (order) => {
    const newOrder = {
      ...order,
      _id: `order_${Date.now()}`,
      orderNumber: `ORD-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: "completed",
    };
    store.orders = [newOrder, ...store.orders];
    store.orderStats = {
      ...store.orderStats,
      totalOrders: store.orderStats.totalOrders + 1,
      activeOrders: store.orderStats.activeOrders + 1,
    };
    return newOrder;
  },

  updateOrder: (id, data) => {
    const index = store.orders.findIndex((o) => o._id === id);
    if (index !== -1) {
      store.orders[index] = { ...store.orders[index], ...data };
      return store.orders[index];
    }
    return null;
  },

  addTransaction: (transaction) => {
    const newTransaction = {
      ...transaction,
      _id: `txn_${Date.now()}`,
      transactionNumber: `TXN-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    store.transactions = [newTransaction, ...store.transactions];
    store.transactionStats = {
      ...store.transactionStats,
      totalTransactions: store.transactionStats.totalTransactions + 1,
    };
    return newTransaction;
  },

  addUser: (user) => {
    const newUser = { ...user, _id: `user_${Date.now()}`, createdAt: new Date().toISOString() };
    store.users = [newUser, ...store.users];
    return newUser;
  },

  updateUser: (id, data) => {
    const index = store.users.findIndex((u) => u._id === id);
    if (index !== -1) {
      store.users[index] = { ...store.users[index], ...data };
      return store.users[index];
    }
    return null;
  },

  deleteUser: (id) => {
    store.users = store.users.filter((u) => u._id !== id);
    return true;
  },

  updateSettings: (data) => {
    store.settings = { ...store.settings, ...data };
    return store.settings;
  },

  reset: () => {
    store = {
      menuItems: [...mockMenuItems],
      categories: [...mockCategories],
      orders: [...mockOrders],
      orderStats: { ...mockOrderStats },
      transactions: [...mockTransactions],
      transactionStats: { ...mockTransactionStats },
      analytics: { ...mockAnalytics },
      settings: { ...mockSettings },
      auditLogs: [...mockAuditLogs],
      users: [
        {
          _id: "demo_user_001",
          name: "Admin User",
          email: "admin@demo.com",
          role: "admin",
          status: "active",
        },
        {
          _id: "demo_user_002",
          name: "Jane Staff",
          email: "staff@demo.com",
          role: "staff",
          status: "active",
        },
      ],
    };
  },
};

export default mockStore;