/**
 * API Client
 * Minimal + clean client for interacting with the API
 * Handles authentication, error handling, timeouts, and response normalization
 */

import { DEFAULT_HEADERS, API_BASE, DEFAULT_TIMEOUT } from "@/constants";

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
  {
    method = "GET",
    data,
    headers = {},
    timeout = DEFAULT_TIMEOUT,
    ...options
  } = {}
) {
  const url = `${API_BASE}${endpoint}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  const config = {
    method,
    headers: { ...DEFAULT_HEADERS, ...headers },
    signal: controller.signal,
    ...options,
  };

  // Handle JSON vs FormData
  if (data instanceof FormData) {
    config.body = data;
    // let browser set the right Content-Type with boundary
    delete config.headers["Content-Type"];
  } else if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, config);
    clearTimeout(timer);

    const contentType = response.headers.get("content-type");
    const result = contentType?.includes("application/json")
      ? await response.json()
      : await response.text();

    // Handle API response format
    if (typeof result === "object" && result !== null && "success" in result) {
      if (!result.success) {
        // Log detailed error information for debugging
        console.error("API Error Details:", {
          url,
          method,
          status: response.status,
          code: result.code,
          error: result.error || null,
          fullResponse: result,
        });

        throw new ApiError(
          `API request failed: ${result.code || "UNKNOWN_ERROR"} (${
            response.status
          })`,
          result.code || "API_ERROR",
          result.error?.details || [],
          response.status
        );
      }
      return result.data; // ✅ normalized data
    }

    // Fallback if backend didn't use ResponseBuilder
    if (!response.ok) {
      // Log detailed error information for debugging
      console.error("HTTP Error Details:", {
        url,
        method,
        status: response.status,
        statusText: response.statusText,
        response: result,
      });

      throw new ApiError(
        `HTTP Error: ${response.statusText || "Unknown error"} (${
          response.status
        })`,
        "HTTP_ERROR",
        [],
        response.status
      );
    }

    return result;
  } catch (err) {
    clearTimeout(timer);

    if (err.name === "AbortError") {
      console.error("Request timeout:", { url, method, timeout });
      throw new ApiError("Request timeout", "TIMEOUT", [], 408);
    }
    if (err instanceof ApiError) {
      throw err;
    }
    if (err.name === "TypeError" && err.message.includes("fetch")) {
      console.error("Network error:", { url, method, error: err.message });
      throw new ApiError("Network error", "NETWORK_ERROR", [], 0);
    }

    // Log unexpected errors
    console.error("Unexpected API error:", {
      url,
      method,
      error: err.message,
      stack: err.stack,
    });

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
