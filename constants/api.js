/**
 * API Constants
 * Configuration constants for API client and requests
 */

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api";
export const DEFAULT_TIMEOUT = 15000; // 15s default timeout

export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};
