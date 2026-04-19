# TanStack Query v5 Implementation Guide

This document summarizes the key architectural changes and best practices implemented during the POSify frontend modernization.

## 1. Key API Changes in v5

### Cache Management
- **`cacheTime` renamed to `gcTime`**: Garbage collection time is now more explicitly named.
- **Persistence**: Switched from manual `persistQueryClient` to the declarative `<PersistQueryClientProvider />`.

### Modern Fetching Patterns
- **Suspense Hooks**: Introduced `useSuspenseQuery`, `useSuspenseInfiniteQuery`, and `useSuspenseQueries`. These hooks are designed to be used within `React.Suspense` boundaries, eliminating the need for manual `isLoading` checks in the component body.
- **Simplified Arguments**: Hooks now strictly take a single configuration object.

## 2. Persistence Layer

We use the `@tanstack/query-sync-storage-persister` to handle offline-first capabilities and state recovery.

### Configuration (`lib/query-client.js`)
```javascript
export const localStoragePersister = createSyncStoragePersister({
  storage: typeof window !== "undefined" ? window.localStorage : undefined,
  key: "posify-query-cache",
});

export const persistOptions = {
  persister: localStoragePersister,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  buster: "v1", // Increment this to force-clear cache for all users
};
```

## 3. Optimistic UI Updates

v5 simplifies tracking pending mutations globally using the `useMutationState` hook.

### The "UI-Driven" Pattern
Instead of manually updating the cache in `onMutate`, we now:
1.  Assign a `mutationKey` to the mutation.
2.  Use `useMutationState` in the view component to fetch all pending variables.
3.  Combine pending variables with the actual data for an "instant" UI feel.

```javascript
const pendingOrders = useMutationState({
  filters: { mutationKey: ["orders"], status: "pending" },
  select: (mutation) => mutation.state.variables,
});
```

## 4. Global Sync Monitoring

The `SyncIndicator` component utilizes global mutation state to provide real-time feedback on "background" operations.

- **Pending**: Shows a "Syncing" status with a pulsing indicator.
- **Error**: Alerts the user if any background operation failed (critical for offline-first apps).
- **Online**: Confirms all data is safely persisted to the local browser storage.

## 5. Declarative Data Fetching (Suspense)

By moving from `useQuery` to `useSuspenseQuery`, components can focus entirely on the "Data Present" state.

- **Loading States**: Handled by a parent `<Suspense fallback={<Loading />} />`.
- **Error Handling**: Handled by a parent `<ErrorBoundary />` or a specialized `<SectionErrorBoundary />`.

This pattern reduces "conditional rendering clutter" and makes the codebase much easier to read and maintain.
