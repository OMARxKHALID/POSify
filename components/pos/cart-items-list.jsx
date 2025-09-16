"use client";

import React from "react";
import { ShoppingCart } from "lucide-react";
import { OrderItem } from "./order-item";

const EmptyCart = React.memo(() => (
  <div className="flex flex-col items-center justify-center h-full py-12 text-center">
    <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mb-4">
      <ShoppingCart className="w-5 h-5 text-muted-foreground" />
    </div>
    <h3 className="text-base font-medium text-foreground mb-1">
      Your cart is empty
    </h3>
    <p className="text-sm text-muted-foreground">
      Add items from the menu to get started
    </p>
  </div>
));

EmptyCart.displayName = "EmptyCart";

export const CartItemsList = React.memo(function CartItemsList({
  orderItems,
  onUpdateQuantity,
  onRemoveItem,
}) {
  if (!orderItems || orderItems.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background min-h-0">
      {orderItems.map((item) => (
        <OrderItem
          key={item._id || item.id}
          item={item}
          onUpdateQuantity={onUpdateQuantity}
          onRemove={onRemoveItem}
        />
      ))}
    </div>
  );
});
