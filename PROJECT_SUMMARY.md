# POSify Project Overview

A modern, Feature-Driven POS & Dashboard application built with Next.js 15, Zustand, and TanStack Query.

---

# Architecture: Feature-Driven

Code is organized by domain, not technical layer.

Path: src/features/<feature-name>/

Each feature is self-contained:

- components/
- hooks/
- stores/
- schemas/
- services/
- constants/

---

# Naming Standards

UI: kebab-case (.jsx) → order-cart.jsx
Hooks: use-kebab-case (.js) → use-orders.js
Services: feature.service.js → orders.service.js
Stores: feature.store.js → cart.store.js
Schemas: feature.schema.js → order.schema.js
Utils: feature.utils.js → common.utils.js
Mock Data: feature.mock.js → orders.mock.js

---

# Core Structure

src/app/ → Next.js routing
src/features/ → Domain modules
src/components/ui/ → Shared UI components
src/lib/ → API client, query client, helpers
src/schemas/ → Shared schemas only

---

# TanStack Query Pattern

All queries MUST follow:

import {
queryKeys,
createServiceQueryFn,
getDefaultQueryOptions
} from "@/lib/helpers/hook.helpers";

import { mockFallback } from "@/lib/mockup-data";
import { useAppContext } from "@/lib/hooks/use-app-context";

const { userId, isDemoMode } = useAppContext();

return useQuery({
queryKey: queryKeys.entityName(filters, userId),

queryFn: createServiceQueryFn(
serviceFn,
() => mockFallback.entityName(filters),
isDemoMode
),

...getDefaultQueryOptions(options),
});

---

# Mutation Pattern

import {
getDefaultMutationOptions,
handleHookSuccess,
handleHookError,
invalidateQueries
} from "@/lib/helpers/hook.helpers";

return useMutation({
mutationFn: (data) => service.method(data),

onSuccess: (\_, variables) => {
invalidateQueries.entity(queryClient);
handleHookSuccess("SUCCESS");
},

onError: (error) => {
handleHookError(error);
},

...getDefaultMutationOptions({ operation: "Action" }),
});

---

# Demo Mode Rules

- Controlled by useAppContext()
- If isDemoMode = true:
  → NO API calls
  → instant mock response

- If false:
  → real API call runs

---

# Service Layer Rule

All services must validate using Zod:

import { entitySchema } from "../schemas/entity.schema";

export const entityService = {
getEntity: async () => {
const res = await apiClient.get("/endpoint");
return entitySchema.parse(res.data);
}
};

---

# Context Rule

All hooks must use:

import { useAppContext } from "@/lib/hooks/use-app-context";

const { userId, isDemoMode } = useAppContext();

DO NOT use useSession inside feature hooks.

---

# Query Helpers

Located in:
src/lib/helpers/hook.helpers.js

Includes:

- queryKeys
- createServiceQueryFn
- getDefaultQueryOptions
- getDefaultMutationOptions
- handleHookSuccess
- handleHookError
- invalidateQueries

---

# Caching Rules

- staleTime: 3 minutes
- refetchOnWindowFocus: false
- Must match across QueryClient and defaults

---

# State Management

Server State → TanStack Query
UI State → Zustand
Persistence → localStorage

---

# Mock Data Rules

Mock data MUST:

- Match schema exactly
- Use valid enum values only
- Avoid extra fields unless intentional
- Never break Zod validation

---

# Final Rule

If it is not in schema → it does NOT exist.

If pattern is broken → it is a bug.
