"use client";

import { useSession } from "@/lib/mock-auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { PageLoading } from "@/components/ui/loading";
import { ADMIN_ROUTES, AUTH_ROUTES } from "@/constants";
import { NAVIGATION_PERMISSIONS } from "@/constants/navigation";
import { hasAnyPermission, hasAllowedRole } from "@/lib/utils/access-control";

export function AuthGuard({ children, fallback = null }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const shouldRedirect = useMemo(() => {
    return status === "unauthenticated";
  }, [status]);

  const isAuthorized = useMemo(() => {
    if (status !== "authenticated" || !session?.user) return true;

    if (
      session.user.role === "super_admin" &&
      (!session.user.permissions || session.user.permissions.length === 0)
    ) {
      return true;
    }

    let routeItem = null;
    for (const section of Object.values(NAVIGATION_PERMISSIONS)) {
      const match = section.find(
        (item) => pathname === item.url || pathname.startsWith(item.url + "/"),
      );
      if (match) {
        routeItem = match;

        break;
      }
    }

    if (!routeItem) return true;

    return (
      hasAnyPermission(session.user, routeItem.permissions) &&
      hasAllowedRole(session.user, routeItem.roles)
    );
  }, [session, status, pathname]);

  useEffect(() => {
    if (shouldRedirect) {
      router.push(AUTH_ROUTES.LOGIN);
    } else if (
      status === "authenticated" &&
      session?.user?.role === "pending"
    ) {
      router.push(AUTH_ROUTES.LOGIN);
    } else if (
      status === "authenticated" &&
      !isAuthorized &&
      pathname !== ADMIN_ROUTES.OVERVIEW
    ) {
      router.push(ADMIN_ROUTES.OVERVIEW);
    }
  }, [shouldRedirect, isAuthorized, status, session, pathname, router]);

  const isLoading = useMemo(() => {
    return status === "loading" || status === "unauthenticated";
  }, [status]);

  if (isLoading) {
    return fallback || <PageLoading />;
  }

  return <>{children}</>;
}

export default AuthGuard;
