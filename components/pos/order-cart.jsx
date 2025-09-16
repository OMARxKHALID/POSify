"use client";

import { useState, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useCartStore } from "@/lib/store/use-cart-store";
import { useSettings } from "@/hooks/use-settings";
import { useCreateOrder } from "@/hooks/use-orders";
import { useCartCalculations } from "@/hooks/use-cart-calculations";
import { getTaxBreakdown } from "@/lib/utils/business-utils";
import { PaymentModal } from "./payment-modal";
import { DiscountModal } from "./discount-modal";
import { CartHeader } from "./cart-header";
import { CartFooter } from "./cart-footer";
import { CartItemsList } from "./cart-items-list";

function generateIdempotencyKey() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function OrderCart({ toggleCart, isMobile = false }) {
  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [pendingOrderKey, setPendingOrderKey] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    orderItems,
    cartDiscount,
    getTotalQuantity,
    updateQuantity,
    removeFromCart,
    clearCart,
    removeCartDiscount,
  } = useCartStore();

  const { status } = useSession();
  const {
    data: settings,
    isLoading: settingsLoading,
    error: settingsError,
    refetch: refetchSettings,
  } = useSettings();

  const createOrder = useCreateOrder();
  const currency = settings?.currency || "USD";
  const hasItems = orderItems.length > 0;
  const totalItems = getTotalQuantity();

  const totals = useCartCalculations(orderItems, cartDiscount, settings?.taxes);

  const handlePlaceOrder = useCallback(
    async (
      customerName,
      paymentMethod,
      mobileNumber,
      deliveryType,
      tableNumber,
      tip = 0
    ) => {
      if (!orderItems.length) return;
      if (status !== "authenticated") {
        toast.error("You must be logged in to place an order.");
        return;
      }
      if (isSubmitting) return;
      if (settingsLoading) {
        toast.error("Settings are still loading. Please wait and try again.");
        return;
      }
      if (settingsError) {
        toast.error("Failed to load settings. Please refresh and try again.");
        return;
      }

      let orgSettings = settings;
      if (!settings?.organizationId) {
        try {
          const result = await refetchSettings();
          if (!result?.data?.organizationId) {
            toast.error(
              "Organization not found. Please refresh and try again."
            );
            return;
          }
          orgSettings = result.data;
        } catch {
          toast.error("Organization not found. Please refresh and try again.");
          return;
        }
      }

      setIsSubmitting(true);
      const idempotencyKey = pendingOrderKey || generateIdempotencyKey();
      setPendingOrderKey(idempotencyKey);

      const subtotalAfterDiscounts =
        totals.subtotal - totals.itemDiscounts - totals.discount;
      const taxBreakdown = getTaxBreakdown(
        subtotalAfterDiscounts,
        orgSettings?.taxes
      );

      const deliveryCharge =
        deliveryType === "delivery"
          ? orgSettings?.operational?.deliverySettings?.deliveryCharge || 0
          : 0;

      let serviceCharge = 0;
      if (orgSettings?.business?.serviceCharge?.enabled) {
        const base =
          orgSettings.business.serviceCharge.applyOn === "total"
            ? totals.total
            : totals.subtotal;
        serviceCharge =
          (orgSettings.business.serviceCharge.percentage / 100) * base;
      }

      const orderData = {
        organizationId: orgSettings?.organizationId,
        items: orderItems.map((item) => ({
          menuItem: item._id || item.id,
          name: item.name || "Unknown Item",
          quantity: Number(item.quantity || 1),
          price: Number(item.price || 0),
          discount: Number(item.discount || 0),
          prepTime: Number(item.prepTime || 15),
        })),
        tableNumber: tableNumber || "",
        customerName: customerName?.trim() || "Guest",
        mobileNumber: mobileNumber?.trim() || "",
        subtotal: Number(totals.subtotal),
        total: Number(totals.total + deliveryCharge + serviceCharge + tip),
        paymentMethod,
        status:
          orgSettings?.operational?.orderManagement?.defaultStatus || "pending",
        deliveryType: deliveryType || "dine-in",
        tax:
          taxBreakdown?.length > 0
            ? taxBreakdown.map((tax) => ({
                id:
                  tax.id ||
                  `tax-${tax.name.toLowerCase().replace(/\s+/g, "-")}`,
                name: tax.name,
                rate: tax.rate,
                type: "percentage",
                amount: Number(tax.amount),
              }))
            : [],
        discount: Number(totals.discount + totals.itemDiscounts),
        promoDiscount: 0,
        couponCode: "",
        serviceCharge: Number(serviceCharge),
        tip: Number(tip),
        isPaid: false,
        refundStatus: "none",
        returns: [],
        deliveryInfo: {
          address: "",
          deliveryCharge: Number(deliveryCharge),
          estimatedDeliveryTime: undefined,
          deliveryStatus: "pending",
          deliveryPartner: "",
        },
        notes: "",
        source: "pos",
        idempotencyKey,
      };

      try {
        const response = await createOrder.mutateAsync(orderData);
        clearCart();
        setPendingOrderKey(null);

        toast.success("Order completed successfully!", {
          id: idempotencyKey,
          description: `Order #${response?.orderNumber || "N/A"} for ${
            customerName || "Guest"
          }`,
        });

        setPaymentModalOpen(false);
        if (isMobile) toggleCart();
      } catch (error) {
        console.error("Order placement failed:", error);
        toast.error("Order Failed", {
          id: idempotencyKey,
          description:
            error?.message || "Failed to place order. Please try again.",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      orderItems,
      totals,
      isMobile,
      status,
      settings,
      settingsLoading,
      settingsError,
      toggleCart,
      createOrder,
      isSubmitting,
      pendingOrderKey,
      clearCart,
      refetchSettings,
    ]
  );

  if (settingsLoading) {
    return (
      <div className="flex flex-col h-full min-h-0">
        <CartHeader
          totalItems={0}
          onClearCart={() => {}}
          onToggleCart={toggleCart}
          isMobile={isMobile}
        />
        <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
          Loading settings...
        </div>
      </div>
    );
  }

  if (settingsError) {
    return (
      <div className="flex flex-col h-full min-h-0">
        <CartHeader
          totalItems={0}
          onClearCart={() => {}}
          onToggleCart={toggleCart}
          isMobile={isMobile}
        />
        <div className="flex-1 flex items-center justify-center text-sm text-red-600">
          Failed to load settings
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <CartHeader
        totalItems={totalItems}
        onClearCart={clearCart}
        onToggleCart={toggleCart}
        isMobile={isMobile}
      />

      <div className="flex-1 min-h-0 flex flex-col">
        {!hasItems ? (
          <CartItemsList
            orderItems={[]}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeFromCart}
          />
        ) : (
          <>
            <CartItemsList
              orderItems={orderItems}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeFromCart}
            />
            <CartFooter
              totals={totals}
              cartDiscount={cartDiscount}
              onDiscountModalOpen={() => setDiscountModalOpen(true)}
              onPaymentModalOpen={() => setPaymentModalOpen(true)}
              onRemoveCartDiscount={removeCartDiscount}
              currency={currency}
              settings={settings}
            />
          </>
        )}
      </div>

      <DiscountModal
        open={discountModalOpen}
        onClose={() => setDiscountModalOpen(false)}
      />

      <PaymentModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        total={totals.total}
        onConfirm={handlePlaceOrder}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
