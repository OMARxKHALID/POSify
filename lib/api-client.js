/**
 * POSify API Client
 * A comprehensive client for interacting with the POSify API
 * Handles authentication, error handling, and response normalization
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api";
const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(message, code, details = [], statusCode = 400) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.details = details;
    this.statusCode = statusCode;
  }
}

/**
 * Core API request function
 */
async function apiRequest(
  endpoint,
  { method = "GET", data, headers = {}, ...options } = {}
) {
  const url = `${API_BASE}${endpoint}`;

  const config = {
    method,
    headers: { ...DEFAULT_HEADERS, ...headers },
    ...options,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, config);

    const contentType = response.headers.get("content-type");
    const result = contentType?.includes("application/json")
      ? await response.json()
      : await response.text();

    // Handle ResponseBuilder format (your custom API responses)
    if (typeof result === "object" && result !== null && "success" in result) {
      if (!result.success) {
        const error = new ApiError(
          result.message || "API request failed",
          result.error?.code || "API_ERROR",
          result.error?.details || [],
          result.statusCode || response.status
        );
        throw error;
      }
      return result.data; // ✅ return only normalized data
    }

    // Fallback if backend didn't use ResponseBuilder
    if (!response.ok) {
      const error = new ApiError(
        result.message || response.statusText || "API request failed",
        "HTTP_ERROR",
        [],
        response.status
      );
      throw error;
    }

    return result;
  } catch (err) {
    // Normalize fetch/network errors
    if (err.name === "AbortError") {
      throw new ApiError("Request timeout", "TIMEOUT", [], 408);
    }

    // Re-throw ApiError instances
    if (err instanceof ApiError) {
      throw err;
    }

    // Handle network errors
    if (err.name === "TypeError" && err.message.includes("fetch")) {
      throw new ApiError("Network error", "NETWORK_ERROR", [], 0);
    }

    throw err;
  }
}

/**
 * Base API client with HTTP methods
 */
export const apiClient = {
  get: (endpoint, options) =>
    apiRequest(endpoint, { method: "GET", ...options }),
  post: (endpoint, data, options) =>
    apiRequest(endpoint, { method: "POST", data, ...options }),
  put: (endpoint, data, options) =>
    apiRequest(endpoint, { method: "PUT", data, ...options }),
  patch: (endpoint, data, options) =>
    apiRequest(endpoint, { method: "PATCH", data, ...options }),
  delete: (endpoint, options) =>
    apiRequest(endpoint, { method: "DELETE", ...options }),
};

/**
 * Authentication API
 */
export const authApi = {
  /**
   * Register a new user (pending role)
   */
  registerUser: (userData) => apiClient.post("/register", userData),

  /**
   * Register a super admin (one-time only)
   */
  registerSuperAdmin: (adminData) =>
    apiClient.post("/register/super-admin", adminData),

  /**
   * Register an organization and link to user
   */
  registerOrganization: (orgData) =>
    apiClient.post("/organizations/register", orgData),
};

/**
 * Dashboard API
 */
export const dashboardApi = {
  /**
   * Get users for an organization with pagination and search
   */
  getUsers: (params = {}) => {
    const searchParams = new URLSearchParams();

    if (params.organizationId)
      searchParams.append("organizationId", params.organizationId);
    if (params.page) searchParams.append("page", params.page);
    if (params.limit) searchParams.append("limit", params.limit);
    if (params.search) searchParams.append("search", params.search);

    const queryString = searchParams.toString();
    return apiClient.get(
      `/dashboard/users${queryString ? `?${queryString}` : ""}`
    );
  },

  /**
   * Get audit logs
   */
  getAuditLogs: (params = {}) => {
    const searchParams = new URLSearchParams();

    if (params.organizationId)
      searchParams.append("organizationId", params.organizationId);
    if (params.page) searchParams.append("page", params.page);
    if (params.limit) searchParams.append("limit", params.limit);
    if (params.action) searchParams.append("action", params.action);
    if (params.userId) searchParams.append("userId", params.userId);
    if (params.startDate) searchParams.append("startDate", params.startDate);
    if (params.endDate) searchParams.append("endDate", params.endDate);

    const queryString = searchParams.toString();
    return apiClient.get(
      `/dashboard/audit-logs${queryString ? `?${queryString}` : ""}`
    );
  },

  /**
   * Get categories
   */
  getCategories: (params = {}) => {
    const searchParams = new URLSearchParams();

    if (params.organizationId)
      searchParams.append("organizationId", params.organizationId);
    if (params.page) searchParams.append("page", params.page);
    if (params.limit) searchParams.append("limit", params.limit);
    if (params.search) searchParams.append("search", params.search);
    if (params.status) searchParams.append("status", params.status);

    const queryString = searchParams.toString();
    return apiClient.get(
      `/dashboard/categories${queryString ? `?${queryString}` : ""}`
    );
  },

  /**
   * Get menu items
   */
  getMenuItems: (params = {}) => {
    const searchParams = new URLSearchParams();

    if (params.organizationId)
      searchParams.append("organizationId", params.organizationId);
    if (params.categoryId) searchParams.append("categoryId", params.categoryId);
    if (params.page) searchParams.append("page", params.page);
    if (params.limit) searchParams.append("limit", params.limit);
    if (params.search) searchParams.append("search", params.search);
    if (params.status) searchParams.append("status", params.status);

    const queryString = searchParams.toString();
    return apiClient.get(
      `/dashboard/menu${queryString ? `?${queryString}` : ""}`
    );
  },

  /**
   * Get orders
   */
  getOrders: (params = {}) => {
    const searchParams = new URLSearchParams();

    if (params.organizationId)
      searchParams.append("organizationId", params.organizationId);
    if (params.page) searchParams.append("page", params.page);
    if (params.limit) searchParams.append("limit", params.limit);
    if (params.status) searchParams.append("status", params.status);
    if (params.startDate) searchParams.append("startDate", params.startDate);
    if (params.endDate) searchParams.append("endDate", params.endDate);

    const queryString = searchParams.toString();
    return apiClient.get(
      `/dashboard/orders${queryString ? `?${queryString}` : ""}`
    );
  },

  /**
   * Get organizations
   */
  getOrganizations: (params = {}) => {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append("page", params.page);
    if (params.limit) searchParams.append("limit", params.limit);
    if (params.search) searchParams.append("search", params.search);
    if (params.status) searchParams.append("status", params.status);

    const queryString = searchParams.toString();
    return apiClient.get(
      `/dashboard/organizations${queryString ? `?${queryString}` : ""}`
    );
  },

  /**
   * Get overview/analytics data
   */
  getOverview: (params = {}) => {
    const searchParams = new URLSearchParams();

    if (params.organizationId)
      searchParams.append("organizationId", params.organizationId);
    if (params.period) searchParams.append("period", params.period); // daily, weekly, monthly
    if (params.startDate) searchParams.append("startDate", params.startDate);
    if (params.endDate) searchParams.append("endDate", params.endDate);

    const queryString = searchParams.toString();
    return apiClient.get(
      `/dashboard/overview${queryString ? `?${queryString}` : ""}`
    );
  },

  /**
   * Get settings
   */
  getSettings: (params = {}) => {
    const searchParams = new URLSearchParams();

    if (params.organizationId)
      searchParams.append("organizationId", params.organizationId);

    const queryString = searchParams.toString();
    return apiClient.get(
      `/dashboard/settings${queryString ? `?${queryString}` : ""}`
    );
  },

  /**
   * Get onboarding status
   */
  getOnboarding: (params = {}) => {
    const searchParams = new URLSearchParams();

    if (params.organizationId)
      searchParams.append("organizationId", params.organizationId);

    const queryString = searchParams.toString();
    return apiClient.get(
      `/dashboard/onboarding${queryString ? `?${queryString}` : ""}`
    );
  },
};

/**
 * CRUD API helpers
 */
export const crudApi = {
  /**
   * Generic create function
   */
  create: (endpoint, data) => apiClient.post(endpoint, data),

  /**
   * Generic read function
   */
  read: (endpoint, params = {}) => {
    const searchParams = new URLSearchParams(params);
    const queryString = searchParams.toString();
    return apiClient.get(`${endpoint}${queryString ? `?${queryString}` : ""}`);
  },

  /**
   * Generic update function
   */
  update: (endpoint, data) => apiClient.put(endpoint, data),

  /**
   * Generic partial update function
   */
  patch: (endpoint, data) => apiClient.patch(endpoint, data),

  /**
   * Generic delete function
   */
  delete: (endpoint) => apiClient.delete(endpoint),
};

/**
 * Utility functions
 */
export const apiUtils = {
  /**
   * Build query string from object
   */
  buildQueryString: (params) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, value);
      }
    });
    return searchParams.toString();
  },

  /**
   * Handle API errors with user-friendly messages
   */
  handleError: (error) => {
    if (error instanceof ApiError) {
      return {
        message: error.message,
        code: error.code,
        details: error.details,
        statusCode: error.statusCode,
      };
    }

    return {
      message: "An unexpected error occurred",
      code: "UNKNOWN_ERROR",
      details: [],
      statusCode: 500,
    };
  },

  /**
   * Check if error is a specific type
   */
  isErrorType: (error, code) => {
    return error instanceof ApiError && error.code === code;
  },

  /**
   * Check if error is a validation error
   */
  isValidationError: (error) => {
    return apiUtils.isErrorType(error, "VALIDATION_ERROR");
  },

  /**
   * Check if error is an authentication error
   */
  isAuthError: (error) => {
    return (
      apiUtils.isErrorType(error, "UNAUTHORIZED") ||
      apiUtils.isErrorType(error, "FORBIDDEN")
    );
  },

  /**
   * Check if error is a not found error
   */
  isNotFoundError: (error) => {
    return apiUtils.isErrorType(error, "NOT_FOUND");
  },

  /**
   * Check if error is a conflict error
   */
  isConflictError: (error) => {
    return apiUtils.isErrorType(error, "CONFLICT");
  },
};

/**
 * Type definitions for better IDE support
 */
export const apiTypes = {
  // User types
  User: {
    _id: "string",
    name: "string",
    email: "string",
    role: "pending" | "admin" | "staff" | "super_admin",
    status: "active" | "inactive" | "suspended",
    organizationId: "string | null",
    permissions: "string[]",
    emailVerified: "boolean",
    lastLogin: "Date | null",
    createdAt: "Date",
    updatedAt: "Date",
  },

  // Organization types
  Organization: {
    _id: "string",
    name: "string",
    slug: "string",
    businessType: "string",
    status: "active" | "inactive" | "suspended",
    owner: "string",
    information: "object",
    subscription: "object",
    limits: "object",
    usage: "object",
    onboardingCompleted: "boolean",
    createdAt: "Date",
    updatedAt: "Date",
  },

  // API Response types
  ApiResponse: {
    success: "boolean",
    message: "string",
    data: "any",
    meta: "object",
    timestamp: "string",
    statusCode: "number",
  },

  // Pagination types
  PaginationMeta: {
    page: "number",
    limit: "number",
    total: "number",
    pages: "number",
  },
};

// Default export
export default {
  apiClient,
  authApi,
  dashboardApi,
  crudApi,
  apiUtils,
  apiTypes,
  ApiError,
};
