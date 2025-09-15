"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Edit3 } from "lucide-react";
import { QuantityControl } from "@/components/ui/quantity-control";

const OrderItem = React.memo(function OrderItem() {
  const [discountModalOpen, setDiscountModalOpen] = useState(false);

  const mockItem = {
    id: 1,
    name: "Classic Burger",
    icon: "🍔",
    price: 8.99,
    quantity: 2,
    discount: 10,
    specialInstructions: "Extra cheese, no onions",
  };

  const originalPrice = mockItem.price;
  const finalPrice =
    mockItem.discount > 0
      ? mockItem.price - mockItem.price * (mockItem.discount / 100)
      : mockItem.price;

  return (
    <div className="flex items-start gap-2 p-2 bg-card rounded-lg border">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-sm">
          {mockItem.icon}
        </div>
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <h4 className="font-medium text-xs text-card-foreground leading-tight">
          {mockItem.name}
        </h4>

        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <span>${originalPrice.toFixed(2)} each</span>
          {mockItem.discount > 0 && (
            <Badge variant="secondary" className="text-[9px] px-1 py-0">
              {mockItem.discount}% off
            </Badge>
          )}
        </div>

        {mockItem.specialInstructions && (
          <p className="text-[10px] text-muted-foreground italic leading-tight">
            “{mockItem.specialInstructions}”
          </p>
        )}
      </div>

      <div className="flex flex-col items-end gap-1 min-w-0">
        <QuantityControl
          value={mockItem.quantity}
          onChange={() => {}}
          min={1}
          max={99}
          size="sm"
        />

        <div className="text-xs font-semibold text-card-foreground">
          ${(finalPrice * mockItem.quantity).toFixed(2)}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDiscountModalOpen(true)}
            className="h-5 w-5"
          >
            <Edit3 className="h-2.5 w-2.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => {}}
            className="h-5 w-5 text-destructive hover:text-destructive"
          >
            <X className="h-2.5 w-2.5" />
          </Button>
        </div>
      </div>

      {discountModalOpen && (
        <div className="p-2 border rounded-md text-xs bg-muted">
          Discount Modal (mock)
          <Button
            size="sm"
            className="ml-2"
            onClick={() => setDiscountModalOpen(false)}
          >
            Close
          </Button>
        </div>
      )}
    </div>
  );
});

export { OrderItem };
