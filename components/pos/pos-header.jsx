"use client";

import Link from "next/link";
import {
  ShoppingCart,
  BarChart3,
  Store,
  CloudOff,
  List,
  Calendar,
  Clock,
  Phone,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { OrderQueueManager } from "@/components/pos/order-queue-manager";
import { formatDate, formatTime } from "@/lib/utils/format-utils";
import { useCartStore } from "@/lib/store/use-cart-store";

export function POSHeader() {
  const mockStoreName = "Mock POS System";
  const mockPhone = "123-456-7890";
  const mockDate = new Date("2025-01-01T12:00:00");
  const mockTotalPendingOrders = 2;

  const { getTotalQuantity, toggleCart } = useCartStore();
  const totalItems = getTotalQuantity();

  return (
    <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between  bg-card gap-2 p-2 lg:gap-4 lg:p-3">
      {/* LEFT: Store info & date/time */}
      <div className="flex flex-col gap-1 w-full lg:w-auto">
        <span className="text-sm font-semibold text-card-foreground">
          {mockStoreName}
        </span>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Phone className="w-3 h-3" />
            {mockPhone}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(mockDate)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTime(mockDate)}
          </span>
        </div>
      </div>

      {/* RIGHT: Actions */}
      <div className="flex items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
        {/* Connection Status */}
        <Badge variant="default" className="flex items-center gap-1">
          Online
        </Badge>

        {/* Dashboard Button */}
        <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
          <BarChart3 className="w-3 h-3 mr-1" />
          <span className="hidden sm:inline">Dashboard</span>
        </Button>

        {/* POS Button */}
        <Link href="/" passHref>
          <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
            <Store className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">POS</span>
          </Button>
        </Link>

        {/* Cart Button */}
        <Button
          variant="outline"
          size="sm"
          className="relative h-8 px-3 text-xs"
          onClick={toggleCart}
        >
          <ShoppingCart className="w-3 h-3 mr-1" />
          <span className="hidden sm:inline">Cart</span>
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[9px] rounded-full h-5 w-5 flex items-center justify-center font-semibold shadow-sm border border-background">
              {totalItems}
            </span>
          )}
        </Button>

        {/* Order Queue Indicator */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative p-0 h-8 w-8"
              aria-label="Queued Orders"
            >
              <List className="w-5 h-5 text-orange-600" />
              <span className="absolute -top-1 -right-1 bg-orange-100 text-orange-800 text-[10px] font-semibold rounded-full px-1.5 py-0.5 select-none">
                {mockTotalPendingOrders}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-[90vw] sm:w-[400px] lg:w-[500px] max-w-full p-0"
            sideOffset={8}
          >
            <OrderQueueManager />
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
