/**
 * API Client
 * A comprehensive client for interacting with the API
 * Handles authentication, error handling, and response normalization
 */

import { DEFAULT_HEADERS } from "@/constants";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api";

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
