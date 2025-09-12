/**
 * Navigation & Permissions Constants
 * Maps navigation items to required permissions and allowed roles
 */

// Icons
import {
  LayoutDashboard,
  Building2,
  Users,
  ShoppingCart,
  Package,
  BarChart3,
  Settings,
  Receipt,
  TrendingUp,
  Bell,
  HelpCircle,
  Shield,
  Utensils,
  FolderOpen,
} from "lucide-react";
import { ADMIN_ROUTES } from "./routes";

export const NAVIGATION_PERMISSIONS = {
  main: [
    {
      title: "Dashboard",
      url: "/admin/dashboard/overview",
      icon: LayoutDashboard,
      permissions: ["dashboard:view"],
      roles: ["super_admin", "admin", "staff"],
    },
    {
      title: "Analytics",
      url: "/admin/dashboard/analytics",
      icon: BarChart3,
      permissions: ["reports:view"],
      roles: ["super_admin", "admin"],
    },
  ],
  business: [
    {
      title: "Organization",
      url: "/admin/dashboard/organization",
      icon: Building2,
      permissions: ["organizations:manage"],
      roles: ["admin"],
    },
    {
      title: "Store Settings",
      url: "/admin/dashboard/settings",
      icon: Building2,
      permissions: ["settings:manage"],
      roles: ["admin"],
    },
  ],
  operations: [
    {
      title: "Orders",
      url: "/admin/dashboard/orders",
      icon: ShoppingCart,
      permissions: ["orders:manage"],
      roles: ["super_admin", "admin", "staff"],
    },
    {
      title: "Menu",
      url: ADMIN_ROUTES.MENU,
      icon: Utensils,
      permissions: ["menu:manage"],
      roles: ["admin"],
    },
    {
      title: "Categories",
      url: ADMIN_ROUTES.CATEGORIES,
      icon: FolderOpen,
      permissions: ["category:manage"],
      roles: ["admin"],
    },
    {
      title: "Receipts",
      url: "/admin/dashboard/receipts",
      icon: Receipt,
      permissions: ["orders:manage"],
      roles: ["super_admin", "admin", "staff"],
    },
  ],
  management: [
    {
      title: "Users",
      url: ADMIN_ROUTES.USERS,
      icon: Users,
      permissions: ["users:manage"],
      roles: ["super_admin", "admin"],
    },
    {
      title: "Audit Logs",
      url: ADMIN_ROUTES.AUDIT_LOGS,
      icon: Shield,
      permissions: ["audit:view"],
      roles: ["super_admin", "admin"],
    },
    {
      title: "Reports",
      url: "/admin/dashboard/reports",
      icon: TrendingUp,
      permissions: ["reports:view"],
      roles: ["super_admin", "admin"],
    },
  ],
  system: [
    {
      title: "Settings",
      url: "/admin/dashboard/settings",
      icon: Settings,
      permissions: ["settings:manage"],
      roles: ["super_admin", "admin"],
    },
    {
      title: "Notifications",
      url: "/admin/dashboard/notifications",
      icon: Bell,
      permissions: ["dashboard:view"],
      roles: ["super_admin", "admin", "staff"],
    },
    {
      title: "Help & Support",
      url: "/admin/dashboard/help",
      icon: HelpCircle,
      permissions: ["dashboard:view"],
      roles: ["super_admin", "admin", "staff"],
    },
  ],
};
