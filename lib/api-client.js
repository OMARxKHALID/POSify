import { mockFallback } from "./mockup-data";

export class ApiError extends Error {
  constructor(message, code, details = [], statusCode = 400) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.details = details;
    this.statusCode = statusCode;
  }
}

async function apiRequest(endpoint, { method = "GET", data } = {}) {
  await new Promise((resolve) => setTimeout(resolve, 300));

  console.log(`[MOCK API] ${method} ${endpoint}`, data || "");

  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  if (method === "GET") {
    if (path.includes("/dashboard/orders")) {
      if (path.match(/\/dashboard\/orders\/[a-zA-Z0-9_-]+$/)) {
        const id = path.split("/").pop();
        const order = mockFallback
          .orders()
          .data.orders.find((o) => o._id === id || o.id === id);
        return order || mockFallback.orders().data.orders[0];
      }
      return mockFallback.orders().data;
    }
    if (path.includes("/dashboard/menu")) return mockFallback.menu().data;
    if (path.includes("/dashboard/categories"))
      return mockFallback.categories().data;
    if (path.includes("/dashboard/transactions")) {
      if (path.includes("/stats"))
        return mockFallback.transactions().data.stats;
      return mockFallback.transactions().data;
    }
    if (path.includes("/dashboard/analytics"))
      return mockFallback.analytics().data;
    if (path.includes("/dashboard/settings"))
      return mockFallback.settings().data;
    if (path.includes("/dashboard/users")) return mockFallback.users().data;
    if (path.includes("/dashboard/audit-logs"))
      return mockFallback.auditLogs().data;
    if (path.includes("/organizations")) {
      if (path.includes("/overview")) return mockFallback.organization().data;
      if (path.includes("/available-staff")) return mockFallback.users().data;
      return mockFallback.organization().data;
    }

    return { success: true, data: {} };
  }

  return {
    success: true,
    message: "Operation completed successfully (Mocked)",
    data: data || { id: "mock_id_" + Math.random().toString(36).substr(2, 9) },
  };
}

export const apiClient = {
  get: (endpoint, options) =>
    apiRequest(endpoint, { method: "GET", ...options }),
  post: (endpoint, data, options) =>
    apiRequest(endpoint, { method: "POST", data, ...options }),
  put: (endpoint, data, options) =>
    apiRequest(endpoint, { method: "PUT", data, ...options }),
  patch: (endpoint, data, options) =>
    apiRequest(endpoint, { method: "PATCH", data, ...options }),
  delete: (endpoint, data, options) =>
    apiRequest(endpoint, { method: "DELETE", data, ...options }),
};
