# POSify Architecture & File Structure Guidelines

## Overview

POSify is a frontend-heavy, client-side Point of Sale (POS) and Dashboard application.
It is built with Next.js 15 (App Router), React 19, Zustand for global/client state, and TanStack Query for server state management.

Currently, there is **no real backend**. The application relies on a mock API layer (`apiClient.js`) that serves locally defined mock data.

| Metric | Value |
|---|---|
| **Framework** | Next.js 15.5.2 (App Router, Turbopack) |
| **Language** | JavaScript (no TypeScript) |
| **UI Library** | Radix UI + Tailwind CSS 4 + shadcn/ui |
| **State** | Zustand 5 (persisted) + TanStack Query 5 (persisted) |
| **Forms** | React Hook Form + Zod 4 |
| **Charts** | Recharts |
| **Auth** | Mock (`mock-auth.js` NextAuth-shaped stub) |

---

## Architecture Principles

### 1. Client-Side Rendering (CSR) First
This is a highly interactive POS application requiring offline capabilities, order queuing, and persistent state.
- Use `"use client"` directives for all interactive dashboard pages and POS components.
- Do not prematurely migrate to Server Components (RSC) or Server Actions for POS-centric functionality. RSCs are best reserved for static public-facing landing pages (`/`).

### 2. State Management Separation
- **Server State (TanStack Query):** Used strictly for data fetched from the `apiClient` (e.g., fetching orders, menus, users). Persisted to `localStorage` via `query-sync-storage-persister`.
- **Client/App State (Zustand):** Used for UI-centric or offline-first features (e.g., Cart State, Offline Order Queue, Demo Mode toggle).

### 3. Demo Mode — Two Scenarios
Demo Mode is active in two distinct cases:

1. **New user, no real data yet** — When a real user registers but has not uploaded any products, orders, or settings, their dashboard would be empty. If Demo Mode is enabled, the app populates those empty states with `mockFallback` data so they can see the UI fully populated.

2. **No backend available** — During development or when the API is unreachable, all data hooks fall back to `mockFallback` so the frontend remains fully functional.

The standard pattern for all data-fetching queries is handled by `createDemoQueryFn` in `hook-helpers.js`:
```javascript
queryFn: createDemoQueryFn(
  "/dashboard/resource",
  () => mockFallback.resource().data,
  isDemoMode,
)
```
For hooks with custom data processing (e.g., `useSettings`), keep the custom `queryFn` instead — do not force `createDemoQueryFn` if the hook needs to transform the response shape.

### 4. Shared Dashboard Layouts
Dashboard pages must use the `PageLayout` and `PageHeader` components to ensure consistent error boundaries and loading states:
```javascript
<PageLayout isLoading={isLoading} error={isError ? error : null} errorMessage="Custom message">
  <PageHeader title="Page Title" description="Subtitle" icon={SomeIcon} />
  {/* Page Content */}
</PageLayout>
```

---

## Directory Structure

```
POSify/
├── app/                          # Next.js App Router
│   ├── admin/                    # Admin Dashboard routes
│   │   ├── (auth)/               # Auth route group
│   │   └── dashboard/            # Core dashboard modules (analytics, menu, orders, etc.)
│   ├── pos/                      # POS terminal (standalone UI)
│   └── (public pages)            # Landing, register, etc.
│
├── components/                   # React Components
│   ├── dashboard/                # Shared dashboard layouts (PageLayout, PageHeader)
│   ├── pos/                      # POS-specific components
│   ├── ui/                       # shadcn/ui primitives
│   └── (feature modules)         # form, receipt, settings, etc.
│
├── hooks/                        # Domain-specific custom hooks (use-orders, use-menu)
│
├── lib/                          # Core utilities and configuration
│   ├── api-client.js             # Mock HTTP client wrapper
│   ├── query-client.js           # TanStack Query + persistence config
│   ├── mock-auth.js              # Mock session provider
│   ├── mockup-data/              # Mock definitions (fallback.js, menu-mockup, etc.)
│   ├── store/                    # Zustand stores (cart, queue, demo)
│   ├── helpers/
│   │   ├── hook-helpers.js       # queryKeys, invalidateQueries, createDemoQueryFn
│   │   ├── error-helpers.js      # Error & success message registry
│   │   └── redirect-helpers.js   # Auth-based routing logic
│   └── utils/
│       ├── access-control.js     # RBAC checks + user action guards (merged from permission-utils + user-utils)
│       ├── business-utils.js     # Tax, cart totals, price calculations
│       ├── category-utils.js     # Category icon/name formatting
│       ├── common-utils.js       # ID normalization, idempotency keys, array helpers
│       ├── data-transformers.js  # API response normalizers (formatUserData, formatOrderData, cleanUserResponse)
│       ├── display-formatters.js # Presentation helpers (formatDate, formatTime, formatCurrency)
│       ├── menu-utils.js         # Menu item formatting for API submission
│       ├── order-utils.js        # Order status/payment/delivery display maps + filtering
│       └── ui-utils.js           # cn(), badge variants (role, status, audit action/resource), user initials
│
├── schemas/                      # Zod validation schemas
├── constants/                    # Application constants
└── public/                       # Static assets
```

---

## lib/utils/ — What Goes Where

| File | Contains |
|---|---|
| `access-control.js` | `hasAnyPermission`, `hasAllowedRole`, `filterNavigationByPermissions`, `canEditUser`, `canDeleteUser`, `canCreateUsers` |
| `business-utils.js` | Tax calculations, cart totals, item pricing |
| `category-utils.js` | Category icon/color resolution, name formatting |
| `common-utils.js` | `normalizeItemId`, `normalizeItem`, `findItemById`, `filterItemsById`, `generateIdempotencyKey` |
| `data-transformers.js` | `formatApiData`, `formatUserData`, `formatOrderData`, `formatAuditLogData`, `formatOrganizationData`, `cleanUserResponse` |
| `display-formatters.js` | `formatDate`, `formatTime`, `formatCurrency` |
| `menu-utils.js` | Menu item prep for API, category color/icon lookup |
| `order-utils.js` | `getOrderStatusInfo`, `getPaymentMethodInfo`, `getDeliveryTypeInfo`, `formatOrderDate`, `calculateOrderStats`, `filterOrders` |
| `ui-utils.js` | `cn`, `getRoleBadgeVariant`, `getStatusBadgeVariant`, `getStatusIcon`, `getUserInitials`, `getAuditActionVariant`, `getAuditResourceVariant` |

---

## Critical Best Practices & Known Gotchas

### 1. React Query Persistence Cache Buster
`lib/query-client.js` persists the query cache to `localStorage`.
**Rule:** If you change the shape of an API response or mock data, you MUST bump the `buster` string (e.g., `"v2"` to `"v3"`). Failure to do so will cause the UI to load stale cached data with the old structure, leading to runtime crashes (e.g., `performance.kpis.map is not a function`).

### 2. Consistent Hook Patterns
All standard data queries use `createDemoQueryFn` from `hook-helpers.js`.
Only use a custom `queryFn` when the hook needs to transform the response shape after fetching (e.g., `useSettings` which builds computed fields like `isAdmin`, `isOwner`).

### 3. File Naming & Folder Conventions
- React hooks MUST be named `use-<name>.js` and reside in the root `hooks/` directory.
- Non-hook utilities MUST NOT be prefixed with `use-` and should reside in `lib/utils/` or `lib/helpers/`.
- The `hooks/` directory is strictly for React hooks. All helpers for hooks belong in `lib/helpers/hook-helpers.js`.
- Badge/display variant functions belong in `lib/utils/ui-utils.js` regardless of the domain they serve.
- Do not create single-purpose utility files with fewer than 3 functions — consolidate into the appropriate existing file.

### 4. Handling Offline Queue
The `use-order-queue-sync.js` hook manages offline order creation. Ensure mutations (`useCreateOrder`) correctly handle network errors and idempotency keys to prevent duplicate order submissions when the app regains connectivity.
