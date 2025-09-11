import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { createMethodHandler } from "@/lib/api";

/**
 * NextAuth.js API route handler
 * Handles all authentication-related requests including:
 * - Login/logout
 * - Session management
 * - CSRF protection
 * - Callback handling
 */
const handler = NextAuth(authOptions);

// Export the main NextAuth routes
export const GET = handler;
export const POST = handler;

// Fallback for unsupported HTTP methods
export const { PUT, DELETE, PATCH } = createMethodHandler(["GET", "POST"]);
