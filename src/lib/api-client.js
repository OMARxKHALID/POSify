import { mockFallback } from "./mockup-data";

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
    const { orders } = mockFallback.orders().data;
    const order = orders.find((o) => o._id === id) ?? orders[0];
    return success(order);
  }
  if (path === "/dashboard/orders" || path.startsWith("/dashboard/orders?")) {
    return success(mockFallback.orders().data);
  }

  if (path === "/dashboard/menu" || path.startsWith("/dashboard/menu?")) {
    return success(mockFallback.menu().data);
  }

  if (
    path === "/dashboard/categories" ||
    path.startsWith("/dashboard/categories?")
  ) {
    return success(mockFallback.categories().data);
  }

  if (path === "/dashboard/transactions/stats") {
    return success(mockFallback.transactions().data.stats);
  }
  if (
    path === "/dashboard/transactions" ||
    path.startsWith("/dashboard/transactions?")
  ) {
    return success(mockFallback.transactions().data);
  }

  if (
    path === "/dashboard/analytics" ||
    path.startsWith("/dashboard/analytics?")
  ) {
    return success(mockFallback.analytics().data);
  }

  if (
    path === "/dashboard/settings" ||
    path.startsWith("/dashboard/settings?")
  ) {
    return success(mockFallback.settings().data);
  }

  if (path === "/dashboard/users" || path.startsWith("/dashboard/users?")) {
    return success(mockFallback.users().data);
  }

  if (
    path === "/dashboard/audit-logs" ||
    path.startsWith("/dashboard/audit-logs?")
  ) {
    return success(mockFallback.auditLogs().data);
  }

  if (path.includes("/organizations/overview")) {
    return success(mockFallback.organization().data);
  }
  if (path.includes("/organizations/available-staff")) {
    return success(mockFallback.users().data);
  }
  if (path.includes("/organizations")) {
    return success(mockFallback.organization().data);
  }

  return success({});
}

const VALID_METHODS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]);

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

  return success(
    data ?? { _id: `mock_id_${Math.random().toString(36).slice(2, 11)}` },
    "Operation completed successfully (Mocked)",
  );
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
