# POSify Project Overview

A modern, Feature-Driven POS & Dashboard application built with **Next.js 15**, **Zustand**, and **TanStack Query**.

## 🏗️ Architecture: Feature-Driven

Code is organized by **Domain**, not technical layer.

- **Path:** `src/features/<feature-name>/`
- **Sub-folders:** `components/`, `hooks/`, `stores/`, `schemas/`, `constants/`.

## 📏 Naming Standards

| Type          | Pattern          | Extension | Example                      |
| :------------ | :--------------- | :-------- | :--------------------------- |
| **UI**        | `kebab-case`     | `.jsx`    | `order-cart.jsx`, `page.jsx` |
| **Hooks**     | `use-kebab-case` | `.js`     | `use-orders.js`              |
| **Stores**    | `*.store`        | `.js`     | `cart.store.js`              |
| **Schemas**   | `*.schema`       | `.js`     | `order.schema.js`            |
| **Utils**     | `*.utils`        | `.js`     | `common.utils.js`            |
| **Mock Data** | `*.mock`         | `.js`     | `orders.mock.js`             |

## 📂 Core Structure

- `src/app/`: Next.js Routing & Layouts.
- `src/features/`: Isolated domain modules.
- `src/components/ui/`: Standardized shadcn/ui primitives.
- `src/lib/`: Shared infrastructure (API client, Query client).
- `src/constants/` & `src/schemas/`: Truly global shared resources.

## 🚀 Key Patterns

- **Path Aliases:** Always use `@/` for `src/` (e.g., `@/features/pos/hooks/use-orders`).
- **State:** `Zustand` for UI/Local state, `React Query` for Server/Mock data.
- **Persistence:** LocalStorage integration for offline-ready POS functionality.
