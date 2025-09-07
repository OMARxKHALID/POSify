"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageLoading } from "@/components/ui/loading";
import { AUTH_ROUTES } from "@/constants";

/**
 * Authentication Guard Component
 * Protects routes that require authentication
 * Redirects unauthenticated users to login page
 */
export function AuthGuard({ children, fallback = null }) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(AUTH_ROUTES.LOGIN);
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return fallback || <PageLoading />;
  }

  return <>{children}</>;
}

// Default export for backward compatibility
export default AuthGuard;
