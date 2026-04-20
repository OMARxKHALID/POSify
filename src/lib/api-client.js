import { mockStore } from "./mockup-data/mock-store";

export class ApiError extends Error {
  constructor(message, code, details, statusCode = 400) {
    super(message);
    this.name = "ApiError";
    this.code = code;

    this.details = details ?? [];
    this.statusCode = statusCode;
  }
}

function normalisePath(endpoint) {
  if (!endpoint || typeof endpoint !== "string") {
    throw new ApiError(
      "endpoint must be a non-empty string",
      "INVALID_ENDPOINT",
      [],
      400,
    );
  }
  return endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
}

function success(data, message = "Operation completed successfully") {
  return { success: true, message, data };
}

function resolveGet(path) {
  const orderDetailMatch = path.match(
    /^\/dashboard\/orders\/([a-zA-Z0-9_-]+)$/,
  );
  if (orderDetailMatch) {
    const id = orderDetailMatch[1];
    const { orders } = mockStore.getOrders();
    const order = orders.find((o) => o._id === id) ?? orders[0];
    return success(order);
  }
  if (path === "/dashboard/orders" || path.startsWith("/dashboard/orders?")) {
    return success(mockStore.getOrders());
  }

  if (path === "/dashboard/menu" || path.startsWith("/dashboard/menu?")) {
    return success(mockStore.getMenu());
  }

  if (
    path === "/dashboard/categories" ||
    path.startsWith("/dashboard/categories?")
  ) {
    return success(mockStore.getCategories());
  }

  if (path === "/dashboard/transactions/stats") {
    return success(mockStore.getTransactions().stats);
  }
  if (
    path === "/dashboard/transactions" ||
    path.startsWith("/dashboard/transactions?")
  ) {
    return success(mockStore.getTransactions());
  }

  const analyticsMatch = path.match(/\/dashboard\/analytics\?timeRange=(\w+)/);
  if (analyticsMatch) {
    return success(mockStore.getAnalytics(analyticsMatch[1]));
  }
  if (
    path === "/dashboard/analytics" ||
    path.startsWith("/dashboard/analytics?")
  ) {
    return success(mockStore.getAnalytics("30d"));
  }

  if (
    path === "/dashboard/settings" ||
    path.startsWith("/dashboard/settings?")
  ) {
    return success(mockStore.getSettings());
  }

  if (path === "/dashboard/users" || path.startsWith("/dashboard/users?")) {
    return success(mockStore.getUsers());
  }

  if (
    path === "/dashboard/audit-logs" ||
    path.startsWith("/dashboard/audit-logs?")
  ) {
    return success(mockStore.getAuditLogs());
  }

  if (path.includes("/organizations/overview")) {
    return success(mockStore.getOrganization());
  }
  if (path.includes("/organizations/available-staff")) {
    return success(mockStore.getUsers());
  }
  if (path.includes("/organizations")) {
    return success({ _id: "demo_org", name: "Demo Restaurant" });
  }

  return success({});
}

const VALID_METHODS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]);

function resolveMutation(path, method, data) {
  const url = new URL(path, "http://localhost");
  const basePath = url.pathname;

  if (basePath.includes("/menu/create")) {
    return success(mockStore.addMenuItem(data), "Menu item created");
  }
  if (basePath.includes("/menu/edit")) {
    const params = url.searchParams;
    const id = params.get("menuItemId");
    return success(mockStore.updateMenuItem(id, data));
  }
  if (basePath.includes("/menu/delete")) {
    const params = url.searchParams;
    const id = params.get("menuItemId");
    mockStore.deleteMenuItem(id);
    return success({ deleted: true });
  }

  if (basePath.includes("/categories/create")) {
    return success(mockStore.addCategory(data));
  }
  if (basePath.includes("/categories/edit")) {
    const params = url.searchParams;
    const id = params.get("categoryId");
    return success(mockStore.updateCategory(id, data));
  }
  if (basePath.includes("/categories/delete")) {
    const params = url.searchParams;
    const id = params.get("categoryId");
    mockStore.deleteCategory(id);
    return success({ deleted: true });
  }

  if (basePath.includes("/orders/create")) {
    return success(mockStore.addOrder(data));
  }
  if (basePath.includes("/orders/edit")) {
    const params = url.searchParams;
    const id = params.get("orderId");
    return success(mockStore.updateOrder(id, data));
  }

  if (basePath.includes("/transactions/create")) {
    return success(mockStore.addTransaction(data));
  }

  if (basePath.includes("/users/create")) {
    return success(mockStore.addUser(data));
  }
  if (basePath.includes("/users/edit")) {
    const params = url.searchParams;
    const id = params.get("userId");
    return success(mockStore.updateUser(id, data));
  }
  if (basePath.includes("/users/delete")) {
    const params = url.searchParams;
    const id = params.get("userId");
    mockStore.deleteUser(id);
    return success({ deleted: true });
  }

  if (basePath === "/dashboard/settings" && method === "PUT") {
    return success(mockStore.updateSettings(data));
  }

  return success(
    data ?? { _id: `mock_id_${Math.random().toString(36).slice(2, 11)}` },
    "Operation completed successfully (Mocked)",
  );
}

async function apiRequest(endpoint, { method = "GET", data } = {}) {
  const path = normalisePath(endpoint);

  if (!VALID_METHODS.has(method)) {
    throw new ApiError(
      `Unsupported HTTP method: ${method}`,
      "INVALID_METHOD",
      [],
      405,
    );
  }

  await new Promise((resolve) => setTimeout(resolve, 300));

  console.log(`[MOCK API] ${method} ${path}`, data ?? "");

  if (method === "GET") {
    return resolveGet(path);
  }

  return resolveMutation(path, method, data);
}

export const apiClient = {
  get: (endpoint, options = {}) =>
    apiRequest(endpoint, { ...options, method: "GET" }),

  post: (endpoint, data, options = {}) =>
    apiRequest(endpoint, { ...options, method: "POST", data }),

  put: (endpoint, data, options = {}) =>
    apiRequest(endpoint, { ...options, method: "PUT", data }),

  patch: (endpoint, data, options = {}) =>
    apiRequest(endpoint, { ...options, method: "PATCH", data }),

  delete: (endpoint, data, options = {}) =>
    apiRequest(endpoint, { ...options, method: "DELETE", data }),
};
