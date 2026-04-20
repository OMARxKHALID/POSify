"use client";

import { useSession } from "@/lib/mock-auth";
import { useIsDemoModeEnabled } from "@/features/settings/hooks/use-demo-mode";

export const useAppContext = () => {
  const { data: session } = useSession();
  const isDemoMode = useIsDemoModeEnabled();
  const userId = session?.user?.id || "default";

  return { userId, isDemoMode };
};

export default useAppContext;