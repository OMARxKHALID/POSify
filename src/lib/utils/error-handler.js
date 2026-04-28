import { z } from "zod";
import { getErrorMessage } from "@/lib/helpers/error.helpers";

export const normalizeError = (error) => {
  if (error instanceof z.ZodError) {
    const firstError = error.errors?.[0];
    return {
      message: firstError
        ? `${firstError.path.join(".")}: ${firstError.message}`
        : "Validation failed",
      code: "VALIDATION_ERROR",
      status: 422,
    };
  }

  const status =
    error?.status || error?.statusCode || error?.response?.status || 500;
  const code = error?.code || error?.response?.data?.code || "UNKNOWN_ERROR";

  const message =
    getErrorMessage(code) ||
    error?.message ||
    error?.response?.data?.message ||
    "An unexpected error occurred";

  return {
    message,
    code,
    status,
  };
};

export class ServiceError extends Error {
  constructor({ message, code, status = 500 }) {
    super(message);
    this.name = "ServiceError";
    this.code = code;
    this.status = status;
  }
}

export const handleServiceError = (error) => {
  const normalized = normalizeError(error);
  throw new ServiceError(normalized);
};
