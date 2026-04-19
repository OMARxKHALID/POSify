"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ADMIN_ROUTES } from "@/constants";


export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {

    router.replace(ADMIN_ROUTES.ANALYTICS);
  }, [router]);


  return null;
}
