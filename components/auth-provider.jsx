"use client";

import { SessionProvider } from "next-auth/react";
import { SESSION_CONFIG } from "@/constants";

/**
 * Auth Provider Component
 * Wraps the app with NextAuth SessionProvider
 * Optimized for performance with minimal refetching
 */
export default function AuthProvider({ children }) {
  return (
    <SessionProvider
      refetchInterval={SESSION_CONFIG.REFETCH_INTERVAL}
      refetchOnWindowFocus={SESSION_CONFIG.REFETCH_ON_WINDOW_FOCUS}
      refetchWhenOffline={SESSION_CONFIG.REFETCH_WHEN_OFFLINE}
      refetchOnMount={SESSION_CONFIG.REFETCH_ON_MOUNT}
    >
      {children}
    </SessionProvider>
  );
}
