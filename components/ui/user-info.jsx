"use client";

import { signOut } from "next-auth/react";
import {
  User,
  LogOut,
  LayoutDashboard,
  ShoppingCart,
  Settings,
  Crown,
  Shield,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

// Helper functions for user display
const getRoleIcon = (role) => {
  switch (role) {
    case "super_admin":
      return <Crown className="w-4 h-4 text-yellow-600" />;
    case "admin":
      return <Shield className="w-4 h-4 text-blue-600" />;
    case "staff":
      return <Users className="w-4 h-4 text-green-600" />;
    default:
      return <User className="w-4 h-4 text-gray-600" />;
  }
};

const getRoleLabel = (role) => {
  switch (role) {
    case "super_admin":
      return "Super Admin";
    case "admin":
      return "Admin";
    case "staff":
      return "Staff";
    default:
      return "User";
  }
};

const getRoleBadgeVariant = (role) => {
  switch (role) {
    case "super_admin":
      return "default";
    case "admin":
      return "secondary";
    case "staff":
      return "outline";
    default:
      return "outline";
  }
};

// User Info Display Component
export function UserInfoDisplay({
  session,
  showOrganization = true,
  className = "",
}) {
  if (!session?.user) return null;

  return (
    <div
      className={`flex items-center gap-2 text-sm transition-all duration-200 ${className}`}
    >
      <div className="flex items-center gap-1.5">
        <span className="font-medium text-foreground hidden md:inline">
          {session.user.name || session.user.email}
        </span>
      </div>
      {showOrganization && session.user.organizationName && (
        <span className="text-xs text-muted-foreground hidden lg:inline">
          @ {session.user.organizationName}
        </span>
      )}
    </div>
  );
}

// User Dropdown Menu Component
export function UserDropdownMenu({
  session,
  showPOS = true,
  showSettings = true,
  logoutCallback = "/",
}) {
  if (!session?.user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 hover:bg-accent"
        >
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">Account</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">
              {session.user.name || session.user.email}
            </p>
            <p className="text-xs text-muted-foreground">
              {getRoleLabel(session.user.role)}
              {session.user.organizationName &&
                ` • ${session.user.organizationName}`}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Dashboard Access */}
        <DropdownMenuItem asChild>
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
        </DropdownMenuItem>

        {/* POS Access for Admin/Staff */}
        {showPOS &&
          (session.user.role === "admin" || session.user.role === "staff") && (
            <DropdownMenuItem asChild>
              <Link href="/pos" className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                POS System
              </Link>
            </DropdownMenuItem>
          )}

        {/* Settings for Admin */}
        {showSettings && session.user.role === "admin" && (
          <DropdownMenuItem asChild>
            <Link
              href="/admin/dashboard/settings"
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: logoutCallback })}
          className="flex items-center gap-2 text-red-600 focus:text-red-600"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Mobile User Info Component
export function MobileUserInfo({ session, className = "" }) {
  if (!session?.user) return null;

  return (
    <div
      className={`flex items-center gap-1.5 text-xs transition-all duration-200 ${className}`}
    >
      <span className="font-medium text-foreground hidden sm:inline">
        {session.user.name || session.user.email}
      </span>
    </div>
  );
}

// Mobile User Menu Component
export function MobileUserMenu({
  session,
  showPOS = true,
  showSettings = true,
  logoutCallback = "/",
}) {
  if (!session?.user) return null;

  return (
    <>
      {/* User Info */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
        <div className="flex items-center gap-2">
          {getRoleIcon(session.user.role)}
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {session.user.name || session.user.email}
            </span>
            <span className="text-xs text-muted-foreground">
              {getRoleLabel(session.user.role)}
              {session.user.organizationName &&
                ` • ${session.user.organizationName}`}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <Button variant="ghost" asChild className="justify-start h-12 text-lg">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <LayoutDashboard className="w-5 h-5" />
          Dashboard
        </Link>
      </Button>

      {showPOS &&
        (session.user.role === "admin" || session.user.role === "staff") && (
          <Button
            variant="ghost"
            asChild
            className="justify-start h-12 text-lg"
          >
            <Link href="/pos" className="flex items-center gap-3">
              <ShoppingCart className="w-5 h-5" />
              POS System
            </Link>
          </Button>
        )}

      {showSettings && session.user.role === "admin" && (
        <Button variant="ghost" asChild className="justify-start h-12 text-lg">
          <Link
            href="/admin/dashboard/settings"
            className="flex items-center gap-3"
          >
            <Settings className="w-5 h-5" />
            Settings
          </Link>
        </Button>
      )}

      <Button
        variant="ghost"
        onClick={() => signOut({ callbackUrl: logoutCallback })}
        className="justify-start h-12 text-lg text-red-600 hover:text-red-600 hover:bg-red-50"
      >
        <LogOut className="w-5 h-5 mr-3" />
        Logout
      </Button>
    </>
  );
}

// Simple User Display (for compact spaces)
export function SimpleUserDisplay({ session, className = "" }) {
  if (!session?.user) return null;

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      <div className="flex items-center gap-1.5">
        <span className="font-medium text-foreground">
          {session.user.name || session.user.email}
        </span>
      </div>
      {session.user.organizationName && (
        <span className="text-xs text-muted-foreground hidden lg:inline">
          @ {session.user.organizationName}
        </span>
      )}
    </div>
  );
}

// Export helper functions for use in other components
export { getRoleIcon, getRoleLabel, getRoleBadgeVariant };
