"use client";

import { useState, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { X, Trash2, Receipt, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/lib/store/use-cart-store";
import { useSettings } from "@/hooks/use-settings";
import { useCreateOrder } from "@/hooks/use-orders";
import {
  calculateTaxAmountWithTaxes,
  getTaxBreakdown,
} from "@/lib/utils/business-utils";
import { formatCurrency } from "@/lib/utils/format-utils";
import { PaymentModal } from "./payment-modal";
import { DiscountModal } from "./discount-modal";
import { OrderItem } from "./order-item";
import { ReceiptGenerator } from "@/components/receipt/receipt-generator";
import { useOrderQueueStore } from "@/lib/store/use-queue-order-store";
import { OrderQueueManager } from "@/components/pos/order-queue-manager";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { useOrderQueueSync } from "@/hooks/use-order-queue-sync";

function generateIdempotencyKey() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // fallback
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

const EmptyCart = () => (
  <div className="flex flex-col items-center justify-center h-full py-8 text-muted-foreground">
    <div className="mb-4 text-6xl text-muted-foreground/20">🛒</div>
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
  <div className="border-t bg-card p-3 space-y-3 flex-shrink-0">
    <div className="space-y-2 text-sm">
      <Row label="Subtotal:" value={`$${totals.subtotal.toFixed(2)}`} />
      {totals.discount > 0 && (
        <Row
          label="Discount:"
          value={`-$${totals.discount.toFixed(2)}`}
          className="text-destructive"
        />
      )}
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
        className="w-full"
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

export function OrderCart({ cartOpen, toggleCart }) {
  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const {
    orderItems,
    cartDiscount,
    getTotalQuantity,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCartStore();

  const totalItems = getTotalQuantity();
  const hasItems = orderItems.length > 0;

  // Calculate totals
  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discount = (subtotal * cartDiscount) / 100;
  const tax = (subtotal - discount) * 0.08;
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
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <h2 className="text-base font-semibold text-card-foreground">
            Order Cart
          </h2>
          {totalItems > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCart}
              className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
              title="Clear cart"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
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
                <OrderItem
                  key={item._id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeFromCart}
                />
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

      <DiscountModal
        open={discountModalOpen}
        onClose={() => setDiscountModalOpen(false)}
      />

      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
      />
    </div>
  );
}
