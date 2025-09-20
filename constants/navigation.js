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
  BarChart3,
  Settings,
  Receipt,
  TrendingUp,
  Bell,
  HelpCircle,
  Shield,
  Utensils,
  FolderOpen,
  DollarSign,
} from "lucide-react";
import { ADMIN_ROUTES } from "./routes";

export const NAVIGATION_PERMISSIONS = {
  main: [
    {
      title: "Dashboard",
      url: ADMIN_ROUTES.OVERVIEW,
      icon: LayoutDashboard,
      permissions: ["dashboard:view"],
      roles: ["super_admin", "admin", "staff"],
    },
    {
      title: "Analytics",
      url: ADMIN_ROUTES.ANALYTICS,
      icon: BarChart3,
      permissions: ["reports:view"],
      roles: ["super_admin", "admin"],
    },
  ],
  operations: [
    {
      title: "Orders",
      url: ADMIN_ROUTES.ORDERS,
      icon: ShoppingCart,
      permissions: ["orders:manage"],
      roles: ["super_admin", "admin", "staff"],
    },
    {
      title: "Transactions",
      url: ADMIN_ROUTES.TRANSACTIONS,
      icon: DollarSign,
      permissions: ["transactions:manage"],
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
      url: ADMIN_ROUTES.REPORTS,
      icon: TrendingUp,
      permissions: ["reports:view"],
      roles: ["super_admin", "admin"],
    },
  ],
  system: [
    {
      title: "Organization",
      url: ADMIN_ROUTES.ORGANIZATION,
      icon: Building2,
      permissions: ["organizations:manage"],
      roles: ["admin"],
    },
    {
      title: "Notifications",
      url: ADMIN_ROUTES.NOTIFICATIONS,
      icon: Bell,
      permissions: ["dashboard:view"],
      roles: ["super_admin", "admin", "staff"],
    },
    {
      title: "Settings",
      url: ADMIN_ROUTES.SETTINGS,
      icon: Settings,
      permissions: ["settings:manage"],
      roles: ["admin"],
    },
  ],
};
