"use client";

import {
  ShoppingCart,
  LayoutDashboard,
  Wifi,
  WifiOff,
  CloudOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/use-cart-store";
import { useMounted } from "@/hooks/use-mounted";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { useOrderQueueStore } from "@/lib/store/use-queue-order-store";
import { ThemeToggle } from "@/components/theme-toggle";
import { OrderQueueManager } from "./order-queue-manager";
import { ADMIN_ROUTES } from "@/constants/routes";
import { useSession } from "next-auth/react";
import { SimpleUserDisplay } from "@/components/ui/user-info";
import Link from "next/link";

export function POSHeader() {
  const { getTotalQuantity, toggleCart } = useCartStore();
  const totalItems = getTotalQuantity();
  const mounted = useMounted();
  const { isOnline } = useNetworkStatus();
  const { data: session } = useSession();
  const { getQueueStats } = useOrderQueueStore();

  const queueStats = getQueueStats();
  const hasQueuedOrders = queueStats.queued > 0 || queueStats.failed > 0;
  const shouldShowQueueManager = !isOnline || hasQueuedOrders;

  return (
    <header className="flex items-center justify-between bg-card border-b border-border/50 px-4 py-3">
      {/* Left side - Title and User */}
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-card-foreground hidden sm:block">
          POS System
        </h1>
        <h1 className="text-sm font-semibold text-card-foreground sm:hidden">
          POS
        </h1>

        {/* User Info */}
        <SimpleUserDisplay session={session} />
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2">
        {/* Network Status */}
        <div className="flex items-center gap-1.5">
          {isOnline ? (
            <Wifi className="w-4 h-4 text-green-600" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-600" />
          )}
          <span className="text-xs font-medium hidden sm:inline">
            {isOnline ? "Online" : "Offline"}
          </span>
        </div>

        {/* Dashboard Button */}
        <Link href={ADMIN_ROUTES.DASHBOARD}>
          <Button variant="outline" size="sm" className="hidden md:flex">
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
          <Button variant="outline" size="sm" className="md:hidden">
            <LayoutDashboard className="w-4 h-4" />
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
          <ShoppingCart className="w-4 h-4 mr-2 hidden sm:inline" />
          <ShoppingCart className="w-4 h-4 sm:hidden" />
          <span className="hidden sm:inline">Cart</span>
          {mounted && totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Button>

        {/* Queue Manager - Show when offline or has queued orders */}
        {shouldShowQueueManager && (
          <OrderQueueManager
            trigger={
              <Button variant="outline" size="sm" className="relative">
                <CloudOff className="w-4 h-4 mr-2 hidden sm:inline" />
                <CloudOff className="w-4 h-4 sm:hidden" />
                <span className="hidden sm:inline">Queue</span>
                {hasQueuedOrders && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {queueStats.queued + queueStats.failed}
                  </span>
                )}
              </Button>
            }
          />
        )}
      </div>
    </header>
  );
}
