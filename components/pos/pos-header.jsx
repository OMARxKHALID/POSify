"use client";

import {
  ShoppingCart,
  LayoutDashboard,
  Wifi,
  WifiOff,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/use-cart-store";
import { useMounted } from "@/hooks/use-mounted";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { ThemeToggle } from "@/components/theme-toggle";
import { ADMIN_ROUTES } from "@/constants/routes";
import { useSession } from "next-auth/react";
import Link from "next/link";

export function POSHeader() {
  const { getTotalQuantity, toggleCart } = useCartStore();
  const totalItems = getTotalQuantity();
  const mounted = useMounted();
  const { isOnline, networkType } = useNetworkStatus();
  const { data: session } = useSession();

  return (
    <header className="flex items-center justify-between bg-card border-b border-border/50 px-4 py-3">
      {/* Left side - Title and User */}
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-card-foreground">
          POS System
        </h1>

        {/* User Info */}
        {session?.user && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="w-4 h-4" />
            <span className="font-medium text-foreground">
              {session.user.name || session.user.email}
            </span>
            <span className="text-xs bg-muted px-2 py-1 rounded-full">
              {session.user.role}
            </span>
          </div>
        )}
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2">
        {/* Network Status Indicator */}
        <div className="flex items-center gap-1">
          {isOnline ? (
            <Wifi className="w-4 h-4 text-green-600" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-600" />
          )}
          <span className="text-xs text-muted-foreground">
            {isOnline ? "Online" : "Offline"}
          </span>
        </div>

        {/* Dashboard Button */}
        <Link href={ADMIN_ROUTES.DASHBOARD}>
          <Button variant="outline" size="sm">
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
        </Link>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Cart Button */}
        <Button
          variant="outline"
          size="sm"
          className="relative"
          onClick={toggleCart}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Cart
          {mounted && totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Button>
      </div>
    </header>
  );
}
