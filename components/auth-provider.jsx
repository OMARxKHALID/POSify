"use client";

import { SessionProvider } from "@/lib/mock-auth";
import { SESSION_CONFIG } from "@/constants";


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
