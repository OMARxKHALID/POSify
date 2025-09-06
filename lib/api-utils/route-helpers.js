/**
 * Route Helpers
 * Simple utilities to eliminate duplication in API routes
 */

import { NextResponse } from "next/server.js";
import { apiError, apiFromZod, apiSuccess } from "./index.js";
import dbConnect from "../db.js";

/**
 * Parse request body with error handling
 */
export const parseRequestBody = async (request) => {
  try {
    return await request.json();
  } catch {
    throw new Error("INVALID_JSON");
  }
};

/**
 * Parse query parameters from URL
 */
export const parseQueryParams = (request) => {
  const { searchParams } = new URL(request.url);
  const params = {};
  for (const [key, value] of searchParams) {
    params[key] = value;
  }
  return params;
};

/**
 * Generic Zod validation helper for all schema types
 * Works with any Zod schema: objects, arrays, primitives, extended schemas, etc.
 */
export const validateWithZod = (schema, data) => {
  const result = schema.safeParse(data);

  if (!result.success) {
    const error = new Error("VALIDATION_ERROR");
    error.zodError = result.error;
    throw error;
  }

  return result.data;
};

/**
 * Connect to database with error handling
 */
export const connectDB = async () => {
  try {
    await dbConnect();
  } catch (error) {
    throw new Error("DB_CONNECTION_ERROR");
  }
};

/**
 * Create a simple API route handler for POST/PUT routes
 */
export const createRouteHandler = (handler, options = {}) => {
  const { requireBody = true, requireValidation = true, schema } = options;

  return async (request) => {
    try {
      // Connect to database
      await connectDB();

      let body = null;
      let validatedData = null;

      // Parse request body if required
      if (requireBody) {
        body = await parseRequestBody(request);
      }

      // Validate with Zod if required and schema provided
      if (requireValidation && schema) {
        validatedData = validateWithZod(schema, body);
      } else {
        validatedData = body;
      }

      // Call the actual handler
      const result = await handler(validatedData, request);

      // If the handler returns a NextResponse object, return it directly
      if (
        result &&
        typeof result === "object" &&
        result.headers &&
        result.status
      ) {
        return result;
      }

      // Otherwise, wrap the result in a success response
      return NextResponse.json(apiSuccess({ data: result }), { status: 200 });
    } catch (error) {
      // Handle specific error types
      if (error.message === "INVALID_JSON") {
        return NextResponse.json(
          apiError("Invalid JSON payload", "INVALID_JSON", [], 400),
          { status: 400 }
        );
      }

      if (error.message === "VALIDATION_ERROR") {
        return NextResponse.json(apiFromZod(error.zodError), { status: 400 });
      }

      if (error.message === "DB_CONNECTION_ERROR") {
        return NextResponse.json(
          apiError(
            "Database connection failed",
            "DB_CONNECTION_ERROR",
            [],
            503
          ),
          { status: 503 }
        );
      }

      // Re-throw other errors for handleApiError to handle
      throw error;
    }
  };
};

/**
 * Create a GET route handler (no body parsing needed)
 */
export const createGetHandler = (handler) => {
  return async (request) => {
    try {
      // Connect to database
      await connectDB();

      // Parse query parameters
      const queryParams = parseQueryParams(request);

      // Call the actual handler
      return await handler(queryParams, request);
    } catch (error) {
      if (error.message === "DB_CONNECTION_ERROR") {
        return NextResponse.json(
          apiError(
            "Database connection failed",
            "DB_CONNECTION_ERROR",
            [],
            503
          ),
          { status: 503 }
        );
      }

      throw error;
    }
  };
};

/**
 * Create a simple POST route handler with validation
 */
export const createPostHandler = (schema, handler) => {
  return createRouteHandler(handler, {
    requireBody: true,
    requireValidation: true,
    schema,
  });
};

/**
 * Create a simple GET route handler
 */
export const createGetRouteHandler = (handler) => {
  return createGetHandler(handler);
};

/**
 * Create a simple PUT route handler with validation
 */
export const createPutHandler = (schema, handler) => {
  return createRouteHandler(handler, {
    requireBody: true,
    requireValidation: true,
    schema,
  });
};

/**
 * Create a simple DELETE route handler (no body needed)
 */
export const createDeleteHandler = (handler) => {
  return async (request) => {
    try {
      // Connect to database
      await connectDB();

      // Parse query parameters for ID or filters
      const queryParams = parseQueryParams(request);

      // Call the actual handler
      return await handler(queryParams, request);
    } catch (error) {
      if (error.message === "DB_CONNECTION_ERROR") {
        return NextResponse.json(
          apiError(
            "Database connection failed",
            "DB_CONNECTION_ERROR",
            [],
            503
          ),
          { status: 503 }
        );
      }

      throw error;
    }
  };
};
