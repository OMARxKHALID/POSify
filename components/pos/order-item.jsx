"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Trash2 } from "lucide-react";
import { QuantityControl } from "@/components/ui/quantity-control";
import { formatCurrency } from "@/lib/utils/format-utils";
import { useSwipeGesture } from "@/hooks/use-swipe-gesture";

const OrderItem = React.memo(function OrderItem({
  item,
  onUpdateQuantity,
  onRemove,
}) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const [isTouching, setIsTouching] = useState(false);

  if (!item) return null;

  // Swipe gesture handlers
  const handleSwipeLeft = (deltaX) => {
    if (deltaX > 100) {
      // Swipe left to remove
      onRemove?.(item._id);
    } else {
      // Reset position if not enough swipe
      setSwipeOffset(0);
      setIsSwipeActive(false);
    }
  };

  const handleSwipeRight = (deltaX) => {
    // Swipe right to reset
    setSwipeOffset(0);
    setIsSwipeActive(false);
  };

  const handleSwipeMove = (deltaX) => {
    // Only allow left swipes (negative deltaX)
    if (deltaX > 0) {
      const maxSwipe = 120; // Maximum swipe distance
      const clampedOffset = Math.min(deltaX, maxSwipe);
      setSwipeOffset(-clampedOffset);
      setIsSwipeActive(true);
    }
  };

  const swipeHandlers = useSwipeGesture({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    onSwipeMove: handleSwipeMove,
    threshold: 50,
  });

  // Custom touch handlers with visual feedback
  const handleTouchStart = (e) => {
    setIsTouching(true);
    swipeHandlers.onTouchStart(e);
  };

  const handleTouchEnd = (e) => {
    setIsTouching(false);
    swipeHandlers.onTouchEnd(e);
    // If swipe wasn't enough to trigger removal, reset position
    if (Math.abs(swipeOffset) < 100) {
      setSwipeOffset(0);
      setIsSwipeActive(false);
    }
  };

  const originalPrice = item.price;
  const finalPrice =
    item.discount > 0
      ? item.price - item.price * (item.discount / 100)
      : item.price;

  const totalPrice = finalPrice * item.quantity;
  const savings =
    item.discount > 0 ? (originalPrice - finalPrice) * item.quantity : 0;

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Swipe Background - Delete Action */}
      <div className="absolute inset-0 bg-destructive/10 rounded-xl flex items-center justify-end pr-3 z-0">
        {/* Touch hint - appears when touching */}
        {isTouching && (
          <div className="flex items-center gap-1.5 text-destructive/70">
            <span className="text-xs font-medium">Swipe left to remove</span>
          </div>
        )}
      </div>

      {/* Main Item Card */}
      <div
        className={`group relative bg-gradient-to-r from-card to-card/50 border border-border/50 rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-200 hover:border-border z-10 ${
          isTouching ? "scale-[0.98] shadow-lg" : ""
        }`}
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: isSwipeActive ? "none" : "transform 0.3s ease-out",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={swipeHandlers.onTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Remove Button - Always Visible */}
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove?.(item._id);
          }}
          className="absolute top-2 right-2 h-5 w-5 rounded-full bg-destructive/10 hover:bg-destructive/20 text-destructive hover:text-destructive opacity-100 transition-opacity duration-200 z-10"
        >
          <X className="h-2.5 w-2.5" />
        </Button>

        <div className="flex items-center gap-3">
          {/* Item Icon */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-lg shadow-sm border border-primary/10">
              {item.icon || "🍽️"}
            </div>
          </div>

          {/* Item Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-foreground leading-tight mb-1 line-clamp-1">
                  {item.name}
                </h4>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatCurrency(originalPrice)} each</span>
                  {item.discount > 0 && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 border-green-200"
                    >
                      {item.discount}% off
                    </Badge>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="text-right pr-6">
                <div className="text-sm font-bold text-foreground">
                  {formatCurrency(totalPrice)}
                </div>
                {savings > 0 && (
                  <div className="text-xs text-green-600 font-medium">
                    Save {formatCurrency(savings)}
                  </div>
                )}
              </div>
            </div>

            {/* Quantity Control */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Qty:</span>
                <QuantityControl
                  value={item.quantity}
                  onChange={(newQuantity) => {
                    onUpdateQuantity?.(item._id, newQuantity);
                  }}
                  min={1}
                  max={99}
                  size="sm"
                  className="h-7"
                />
              </div>

              {/* Total Price Breakdown */}
              <div className="text-right">
                <div className="text-xs text-muted-foreground">
                  {item.quantity} × {formatCurrency(finalPrice)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export { OrderItem };
