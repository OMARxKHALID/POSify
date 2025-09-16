"use client";

import { OrderItem } from "./order-item";

const EmptyCart = () => (
  <div className="flex flex-col items-center justify-center h-full py-8 text-muted-foreground">
    <div className="mb-4 text-6xl text-muted-foreground/20">🛒</div>
    <p className="mb-1 text-sm font-medium">Your cart is empty</p>
    <p className="text-xs">Add items from the menu to get started</p>
  </div>
);

export function CartItemsList({ orderItems, onUpdateQuantity, onRemoveItem }) {
  if (!orderItems || orderItems.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-background min-h-0">
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
}
