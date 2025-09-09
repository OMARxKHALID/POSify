import { withAuth } from "next-auth/middleware";
import { PUBLIC_ROUTES } from "@/constants";

/**
 * NextAuth Middleware
 * Handles route-level authentication protection
 * Allows public routes and requires authentication for protected routes
 */
export default withAuth(
  function middleware(req) {
    // Additional middleware logic can be added here if needed
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Allow access to public routes
        if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
          return true;
        }

        // Require authentication for all other routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    // Match all request paths except for static files and API routes
    "/((?!api|_next/static|_next/image|favicon.svg).*)",
  ],
};
