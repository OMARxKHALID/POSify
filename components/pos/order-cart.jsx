"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/lib/store/use-cart-store";

const EmptyCart = () => (
  <div className="flex flex-col items-center justify-center h-full py-8 text-muted-foreground">
    <div className="mb-4 text-6xl opacity-20">🛒</div>
    <p className="mb-1 text-sm font-medium">Your cart is empty</p>
    <p className="text-xs">Add items from the menu to get started</p>
  </div>
);

const Row = ({ label, value, className = "" }) => (
  <div className={`flex justify-between ${className}`}>
    <span>{label}</span>
    <span>{value}</span>
  </div>
);

const CartFooter = ({ totals, setDiscountModalOpen, setPaymentModalOpen }) => (
  <div className="border-t bg-muted/30 p-3 space-y-3 flex-shrink-0">
    <div className="space-y-1 text-sm">
      <Row label="Subtotal:" value={`$${totals.subtotal.toFixed(2)}`} />
      <Row
        label="Cart Discount:"
        value={`-$${totals.discount.toFixed(2)}`}
        className="text-destructive"
      />
      <Row label="Tax:" value={`$${totals.tax.toFixed(2)}`} />
      <Separator />
      <Row
        label="Total:"
        value={`$${totals.total.toFixed(2)}`}
        className="text-base font-semibold"
      />
    </div>

    <div className="space-y-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setDiscountModalOpen(true)}
        className="w-full text-xs"
      >
        Apply Discount
      </Button>
      <Button
        onClick={() => setPaymentModalOpen(true)}
        className="w-full"
        size="sm"
      >
        Proceed to Payment
      </Button>
    </div>
  </div>
);

const OrderItem = ({ item }) => (
  <div className="flex items-center justify-between border rounded-lg p-3 bg-card">
    <div className="flex items-center gap-3">
      <span className="text-2xl">{item.icon}</span>
      <div>
        <h4 className="text-sm font-medium">{item.name}</h4>
        <p className="text-xs text-muted-foreground">
          {item.quantity} × ${item.price.toFixed(2)}
        </p>
      </div>
    </div>
    <span className="font-semibold">
      ${(item.price * item.quantity).toFixed(2)}
    </span>
  </div>
);

export function OrderCart({ cartOpen, toggleCart, isMobile }) {
  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const {
    orderItems,
    cartDiscount,
    getTotalQuantity,
    updateQuantity,
    removeFromCart,
  } = useCartStore();

  const totalItems = getTotalQuantity();
  const hasItems = orderItems.length > 0;

  // Calculate totals
  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discount = (subtotal * cartDiscount) / 100;
  const tax = (subtotal - discount) * 0.08; // 8% tax
  const total = subtotal - discount + tax;

  const totals = {
    subtotal,
    discount,
    tax,
    total,
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between p-3 border-b bg-card flex-shrink-0">
        <h2 className="text-base font-semibold text-card-foreground">
          Order Cart
        </h2>
        <div className="flex items-center gap-2">
          {totalItems > 0 && (
            <Badge variant="secondary" className="text-xs">
              {totalItems} item{totalItems !== 1 && "s"}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCart}
            className="h-7 w-7"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        {!hasItems ? (
          <EmptyCart />
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-background min-h-0">
              {orderItems.map((item) => (
                <OrderItem key={item._id} item={item} />
              ))}
            </div>
            <CartFooter
              totals={totals}
              setDiscountModalOpen={setDiscountModalOpen}
              setPaymentModalOpen={setPaymentModalOpen}
            />
          </>
        )}
      </div>

      {discountModalOpen && (
        <div className="p-4 border-t text-center text-sm">
          Discount Modal (mock)
        </div>
      )}

      {paymentModalOpen && (
        <div className="p-4 border-t text-center text-sm">
          Payment Modal (mock)
        </div>
      )}
    </div>
  );
}
