// API route utilities
import dbConnect from "@/lib/db";
import {
  apiError,
  apiSuccess,
  badRequest,
  serverError,
  validationError,
} from "./response-utils";

export const parseRequestBody = async (request) => {
  try {
    return await request.json();
  } catch {
    throw new Error("INVALID_JSON");
  }
};

export const parseQueryParams = (request) => {
  const { searchParams } = new URL(request.url);
  const params = {};
  for (const [key, value] of searchParams) {
    params[key] = value;
  }
  return params;
};

export const validateWithZod = (schema, data) => {
  const result = schema.safeParse(data);

  if (!result.success) {
    const error = new Error("VALIDATION_ERROR");
    error.zodError = result.error;
    throw error;
  }

  return result.data;
};

export const connectDB = async () => {
  try {
    await dbConnect();
  } catch (error) {
    throw new Error("DB_CONNECTION_ERROR");
  }
};

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

      // Call the actual handler with appropriate parameters
      let result;
      if (requireBody) {
        // POST/PUT routes: pass validatedData
        result = await handler(validatedData, request);
      } else {
        // GET/DELETE routes: pass queryParams
        const queryParams = parseQueryParams(request);
        result = await handler(queryParams, request);
      }

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
      return apiSuccess("SUCCESS", result);
    } catch (error) {
      // Handle specific error types
      if (error.message === "INVALID_JSON") {
        return badRequest("INVALID_JSON");
      }

      if (error.message === "VALIDATION_ERROR") {
        return validationError(error.zodError);
      }

      if (error.message === "DB_CONNECTION_ERROR") {
        return apiError("DB_CONNECTION_ERROR", 503);
      }

      // Handle other errors
      return serverError("INTERNAL_ERROR");
    }
  };
};

export const createGetHandler = (handler) => {
  return createRouteHandler(handler, {
    requireBody: false,
    requireValidation: false,
  });
};

export const createPostHandler = (schema, handler) => {
  return createRouteHandler(handler, {
    requireBody: true,
    requireValidation: true,
    schema,
  });
};

export const createPutHandler = (schema, handler) => {
  return createRouteHandler(handler, {
    requireBody: true,
    requireValidation: true,
    schema,
  });
};

export const createDeleteHandler = (handler) => {
  return createRouteHandler(handler, {
    requireBody: false,
    requireValidation: false,
  });
};
