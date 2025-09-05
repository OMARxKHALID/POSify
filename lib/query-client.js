/**
 * TanStack React Query Configuration
 * Centralized query client setup with persistence and error handling
 */

import { QueryClient } from "@tanstack/react-query";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { persistQueryClient } from "@tanstack/react-query-persist-client";

// Create query client with optimized defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache time: 5 minutes
      staleTime: 5 * 60 * 1000,
      // Background refetch: 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.statusCode >= 400 && error?.statusCode < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      // Refetch on window focus in development
      refetchOnWindowFocus: process.env.NODE_ENV === "development",
      // Don't refetch on reconnect by default
      refetchOnReconnect: false,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
    },
  },
});

// Create localStorage persister for query cache
const localStoragePersister = createSyncStoragePersister({
  storage: typeof window !== "undefined" ? window.localStorage : undefined,
  key: "posify-query-cache",
});

// Persist query client (only in browser)
if (typeof window !== "undefined") {
  persistQueryClient({
    queryClient,
    persister: localStoragePersister,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  });
}

export default queryClient;
