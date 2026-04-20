"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/mock-auth";
import { getDefaultRouteForRole } from "@/constants";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    const userRole = session?.user?.role || "admin";
    const targetRoute = getDefaultRouteForRole(userRole);
    router.replace(targetRoute);
  }, [router, session]);

  return null;
}
