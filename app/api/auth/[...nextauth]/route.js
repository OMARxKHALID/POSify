import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { createMethodHandler } from "@/lib/api-utils";

// Create the NextAuth handler
const handler = NextAuth(authOptions);

// Export the main NextAuth routes
export const GET = handler;
export const POST = handler;

// Fallback for unsupported HTTP methods
export const { PUT, DELETE, PATCH } = createMethodHandler(["GET", "POST"]);
