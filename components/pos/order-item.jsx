"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { QuantityControl } from "@/components/ui/quantity-control";
import { formatCurrency } from "@/lib/utils/format-utils";

const OrderItem = React.memo(function OrderItem({
  item,
  onUpdateQuantity,
  onRemove,
}) {
  if (!item) return null;

  const originalPrice = item.price;
  const finalPrice =
    item.discount > 0
      ? item.price - item.price * (item.discount / 100)
      : item.price;

  return (
    <div className="flex items-start gap-2 p-2 bg-card rounded-lg border">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-sm">
          {item.icon || "🍽️"}
        </div>
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <h4 className="font-medium text-xs text-card-foreground leading-tight">
          {item.name}
        </h4>

        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <span>{formatCurrency(originalPrice)} each</span>
          {item.discount > 0 && (
            <Badge variant="secondary" className="text-[9px] px-1 py-0">
              {item.discount}% off
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 min-w-0">
        <QuantityControl
          value={item.quantity}
          onChange={(newQuantity) => onUpdateQuantity?.(item._id, newQuantity)}
          min={1}
          max={99}
          size="sm"
        />

        <div className="text-xs font-semibold text-card-foreground">
          {formatCurrency(finalPrice * item.quantity)}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove?.(item._id)}
            className="h-5 w-5 text-destructive hover:text-destructive"
          >
            <X className="h-2.5 w-2.5" />
          </Button>
        </div>
      </div>
    </div>
  );
});

export { OrderItem };
