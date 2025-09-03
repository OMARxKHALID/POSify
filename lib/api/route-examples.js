/**
 * Route Examples
 * Comprehensive examples showing how to use the route helpers
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createPostHandler,
  createGetHandler,
  createPutHandler,
  createDeleteHandler,
  createRouteHandler,
  createMethodHandler,
} from "./index.js";

// Example schemas
const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["admin", "staff"]),
});

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(["admin", "staff"]).optional(),
});

// ============================================================================
// POST ROUTE EXAMPLE (with validation)
// ============================================================================

export const createUserExample = createPostHandler(
  userSchema,
  async (validatedData) => {
    // validatedData is already validated and typed
    const { name, email, role } = validatedData;

    // Your business logic here
    // No need to validate or parse request body

    return NextResponse.json({
      success: true,
      message: "User created",
      data: { name, email, role },
    });
  }
);

// ============================================================================
// GET ROUTE EXAMPLE (no body, query params only)
// ============================================================================

export const getUsersExample = createGetHandler(async (queryParams) => {
  // queryParams contains all URL query parameters
  const { page = 1, limit = 10, search } = queryParams;

  // Your business logic here
  // No need to connect to DB or parse query params

  return NextResponse.json({
    success: true,
    data: [],
    meta: { page, limit, search },
  });
});

// ============================================================================
// PUT ROUTE EXAMPLE (with validation)
// ============================================================================

export const updateUserExample = createPutHandler(
  updateUserSchema,
  async (validatedData) => {
    // validatedData contains only the fields that were sent
    const { name, email, role } = validatedData;

    // Your business logic here

    return NextResponse.json({
      success: true,
      message: "User updated",
      data: { name, email, role },
    });
  }
);

// ============================================================================
// DELETE ROUTE EXAMPLE (no body, query params only)
// ============================================================================

export const deleteUserExample = createDeleteHandler(async (queryParams) => {
  // queryParams contains ID or filters
  const { userId } = queryParams;

  // Your business logic here

  return NextResponse.json({
    success: true,
    message: "User deleted",
  });
});

// ============================================================================
// CUSTOM ROUTE EXAMPLE (flexible options)
// ============================================================================

export const customRouteExample = createRouteHandler(
  async (data, request) => {
    // Custom logic here
    return NextResponse.json({ success: true });
  },
  {
    requireBody: false, // Don't parse request body
    requireValidation: false, // Don't validate
    schema: null, // No schema needed
  }
);

// ============================================================================
// COMPLETE API ROUTE EXAMPLE
// ============================================================================

// Business logic handlers
const handleCreateUser = async (validatedData) => {
  // Create user logic
  return { success: true, message: "User created" };
};

const handleGetUsers = async (queryParams) => {
  // Get users logic
  return { success: true, data: [] };
};

const handleUpdateUser = async (validatedData) => {
  // Update user logic
  return { success: true, message: "User updated" };
};

const handleDeleteUser = async (queryParams) => {
  // Delete user logic
  return { success: true, message: "User deleted" };
};

// Export all methods for a complete CRUD API
export const POST = createPostHandler(userSchema, handleCreateUser);
export const GET = createGetHandler(handleGetUsers);
export const PUT = createPutHandler(updateUserSchema, handleUpdateUser);
export const DELETE = createDeleteHandler(handleDeleteUser);

// Or use the method handler for unsupported methods
export const { PATCH } = createMethodHandler(["GET", "POST", "PUT", "DELETE"]);
