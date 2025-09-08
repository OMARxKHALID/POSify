"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ADMIN_ROUTES } from "@/constants";

/**
 * Main Dashboard Page
 * Redirects to the analytics page as the default dashboard view
 */
export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to analytics page
    router.replace(ADMIN_ROUTES.ANALYTICS);
  }, [router]);

  // Return null since we're redirecting
  return null;
}
