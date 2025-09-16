"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/use-cart-store";
import { useMounted } from "@/hooks/use-mounted";

export function POSHeader() {
  const { getTotalQuantity, toggleCart } = useCartStore();
  const totalItems = getTotalQuantity();
  const mounted = useMounted();

  return (
    <header className="flex items-center justify-between bg-card ">
      <div>
        <h1 className="text-lg font-semibold text-card-foreground">
          POS System
        </h1>
      </div>

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
    </header>
  );
}
