// API response utilities
import { NextResponse } from "next/server";

// Generic error
export function apiError(code, status = 400) {
  return NextResponse.json({ success: false, code }, { status });
}

// Generic success
export function apiSuccess(code, data, status = 200) {
  return NextResponse.json(
    {
      success: true,
      code,
      data,
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  );
}

// Common error shortcuts
export function badRequest(code) {
  return apiError(code, 400);
}

export function unauthorized(code = "UNAUTHORIZED") {
  return apiError(code, 401);
}

export function forbidden(code = "FORBIDDEN") {
  return apiError(code, 403);
}

export function notFound(code = "NOT_FOUND") {
  return apiError(code, 404);
}

export function conflict(code = "CONFLICT") {
  return apiError(code, 409);
}

export function serverError(code = "INTERNAL_SERVER_ERROR") {
  return apiError(code, 500);
}

// Zod validation error handler
export function validationError(zodError) {
  return NextResponse.json(
    {
      success: false,
      code: "VALIDATION_ERROR",
      error: {
        message: "Validation failed",
        details: zodError?.issues || [],
        issues: zodError?.issues || [],
      },
    },
    { status: 400 }
  );
}

// Mongoose validation error handler
export function mongooseValidationError(mongooseError) {
  return apiError("MONGOOSE_VALIDATION_ERROR", 400);
}
