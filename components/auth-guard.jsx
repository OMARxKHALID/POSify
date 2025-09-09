"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
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

  const shouldRedirect = useMemo(() => {
    return status === "unauthenticated";
  }, [status]);

  useEffect(() => {
    if (shouldRedirect) {
      router.push(AUTH_ROUTES.LOGIN);
    }
  }, [shouldRedirect, router]);

  const isLoading = useMemo(() => {
    return status === "loading" || status === "unauthenticated";
  }, [status]);

  if (isLoading) {
    return fallback || <PageLoading />;
  }

  return <>{children}</>;
}

// Default export for backward compatibility
export default AuthGuard;
