import { DEFAULT_HEADERS, API_BASE, DEFAULT_TIMEOUT } from "@/constants";

export class ApiError extends Error {
  constructor(message, code, details = [], statusCode = 400) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.details = details;
    this.statusCode = statusCode;
  }
}

async function apiRequest(
  endpoint,
  {
    method = "GET",
    data,
    headers = {},
    timeout = DEFAULT_TIMEOUT,
    signal: externalSignal, // FIX 2: Extract external signal separately
    ...options // Now `options` will never contain `signal`
  } = {},
) {
  const url = `${API_BASE}${endpoint}`;
  const controller = new AbortController();

  // FIX 2: Track whether the abort came from our timeout
  let didTimeout = false;
  const timer = setTimeout(() => {
    didTimeout = true;
    controller.abort();
  }, timeout);

  // FIX 2: If an external signal is provided, forward its abort to our controller
  if (externalSignal) {
    if (externalSignal.aborted) {
      clearTimeout(timer);
      throw new ApiError("Request was aborted", "ABORTED", [], 0);
    }
    externalSignal.addEventListener("abort", () => controller.abort(), {
      once: true,
    });
  }

  const config = {
    method,
    // FIX 1: `signal` is now set AFTER `...options`, and `options` can't
    // contain `signal` anymore (it was destructured out above), so our
    // controller signal can never be overridden.
    ...options,
    headers: { ...DEFAULT_HEADERS, ...headers },
    signal: controller.signal,
  };

  if (data instanceof FormData) {
    config.body = data;
    delete config.headers["Content-Type"];
  } else if (data !== undefined && data !== null) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, config);
    clearTimeout(timer);

    const contentType = response.headers.get("content-type");
    const result = contentType?.includes("application/json")
      ? await response.json()
      : await response.text();

    if (typeof result === "object" && result !== null && "success" in result) {
      if (!result.success) {
        const errorCode = result.code || "API_ERROR";
        const serverErrorMessage = result.error?.message;
        const errorMessage = serverErrorMessage
          ? `${serverErrorMessage} (${errorCode})`
          : `API request failed: ${errorCode} (${response.status})`;

        console.error(">>> API ERROR [apiRequest] <<<", {
          endpoint: url,
          method,
          status: response.status,
          errorCode,
          errorMessage,
          errorDetails: result.error?.details || [],
          rawResponse: result,
        });

        throw new ApiError(
          errorMessage,
          errorCode,
          result.error?.details || [],
          response.status,
        );
      }
      return result.data;
    }

    if (!response.ok) {
      console.error("HTTP Error Details:", {
        url,
        method,
        status: response.status,
        statusText: response.statusText,
        response: result,
      });

      throw new ApiError(
        `HTTP Error: ${response.statusText || "Unknown error"} (${response.status})`,
        "HTTP_ERROR",
        [],
        response.status,
      );
    }

    return result;
  } catch (err) {
    // FIX 5: Only clear the timer if it hasn't already fired
    if (!didTimeout) {
      clearTimeout(timer);
    }

    if (err.name === "AbortError") {
      // FIX 2: Correctly distinguish timeout vs external/user abort
      if (didTimeout) {
        console.error("Request timeout:", { url, method, timeout });
        throw new ApiError("Request timeout", "TIMEOUT", [], 408);
      }
      console.error("Request aborted:", { url, method });
      throw new ApiError("Request was aborted", "ABORTED", [], 0);
    }

    if (err instanceof ApiError) {
      throw err;
    }

    // FIX 3: Detect network errors more reliably instead of sniffing err.message
    if (err instanceof TypeError) {
      console.error("Network error:", { url, method, error: err.message });
      throw new ApiError("Network error", "NETWORK_ERROR", [], 0);
    }

    console.error("Unexpected API error:", {
      url,
      method,
      error: err.message,
      stack: err.stack,
    });

    throw err;
  }
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
  // FIX 4: Support optional body on DELETE (some APIs require it)
  delete: (endpoint, data, options) =>
    apiRequest(endpoint, { method: "DELETE", data, ...options }),
};
