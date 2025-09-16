"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useCartStore } from "@/lib/store/use-cart-store";
import { useSettings } from "@/hooks/use-settings";
import { useCreateOrder } from "@/hooks/use-orders";
import { useCartCalculations } from "@/hooks/use-cart-calculations";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { useOrderQueueStore } from "@/lib/store/use-queue-order-store";
import { getTaxBreakdown } from "@/lib/utils/business-utils";
import { PaymentModal } from "./payment-modal";
import { DiscountModal } from "./discount-modal";
import { CartHeader } from "./cart-header";
import { CartFooter } from "./cart-footer";
import { CartItemsList } from "./cart-items-list";
import { generateIdempotencyKey } from "@/lib/utils";

/* ------------------------- Helpers ------------------------- */

/**
 * Prepare order data for submission
 */
const prepareOrderData = (
  orderItems,
  totals,
  orgSettings,
  customerData,
  idempotencyKey
) => {
  const {
    customerName,
    paymentMethod,
    mobileNumber,
    deliveryType,
    tip = 0,
  } = customerData;

  const safeSubtotal = totals?.subtotal ?? 0;
  const safeTotal = totals?.total ?? 0;
  const safeItemDiscounts = totals?.itemDiscounts ?? 0;
  const safeDiscount = totals?.discount ?? 0;

  const subtotalAfterDiscounts =
    safeSubtotal - safeItemDiscounts - safeDiscount;

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
        ? safeTotal
        : safeSubtotal;
    serviceCharge =
      (orgSettings.business.serviceCharge.percentage / 100) * base;
  }

  return {
    organizationId: orgSettings?.organizationId,
    items: orderItems.map((item) => ({
      menuItem: item._id || item.id,
      name: item.name || "Unknown Item",
      quantity: Number(item.quantity || 1),
      price: Number(item.price || 0),
      discount: Number(item.discount || 0),
      prepTime: Number(item.prepTime || 15),
    })),
    customerName: customerName?.trim() || "Guest",
    mobileNumber: mobileNumber?.trim() || "",
    subtotal: Number(safeSubtotal),
    total: Number(safeTotal + deliveryCharge + serviceCharge + tip),
    paymentMethod,
    status:
      orgSettings?.operational?.orderManagement?.defaultStatus || "pending",
    deliveryType: deliveryType || "dine-in",
    tax:
      taxBreakdown?.length > 0
        ? taxBreakdown.map((tax) => ({
            id: tax.id || `tax-${tax.name.toLowerCase().replace(/\s+/g, "-")}`,
            name: tax.name,
            rate: tax.rate,
            type: "percentage",
            amount: Number(tax.amount),
          }))
        : [],
    discount: Number(safeDiscount + safeItemDiscounts),
    promoDiscount: 0,
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
    idempotencyKey,
  };
};

/**
 * Validate order prerequisites
 */
const validateOrderPrerequisites = (
  orderItems,
  status,
  settingsLoading,
  settingsError
) => {
  if (!orderItems.length) {
    return { isValid: false, error: "No items in cart" };
  }

  if (status !== "authenticated") {
    return {
      isValid: false,
      error: "You must be logged in to place an order.",
    };
  }

  if (settingsLoading) {
    return {
      isValid: false,
      error: "Settings are still loading. Please wait and try again.",
    };
  }

  if (settingsError) {
    return {
      isValid: false,
      error: "Failed to load settings. Please refresh and try again.",
    };
  }

  return { isValid: true };
};

/* ------------------------- Component ------------------------- */

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
  const { isOnline } = useNetworkStatus();
  const { addOrder } = useOrderQueueStore();

  const currency = settings?.currency || "USD";
  const hasItems = orderItems.length > 0;
  const totalItems = getTotalQuantity();
  const totals = useCartCalculations(orderItems, cartDiscount, settings?.taxes);

  const handlePlaceOrder = async (
    customerName,
    paymentMethod,
    mobileNumber,
    deliveryType,
    tip = 0
  ) => {
    const validation = validateOrderPrerequisites(
      orderItems,
      status,
      settingsLoading,
      settingsError
    );
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    if (isSubmitting) return;

    let orgSettings = settings;
    if (!settings?.organizationId) {
      try {
        const result = await refetchSettings();
        if (!result?.data?.organizationId) {
          toast.error("Organization not found. Please refresh and try again.");
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

    try {
      const orderData = prepareOrderData(
        orderItems,
        totals,
        orgSettings,
        { customerName, paymentMethod, mobileNumber, deliveryType, tip },
        idempotencyKey
      );

      if (isOnline) {
        await createOrder.mutateAsync(orderData);
        clearCart();
        setPendingOrderKey(null);
        setPaymentModalOpen(false);
        if (isMobile) toggleCart();
      } else {
        addOrder(orderData);
        clearCart();
        setPendingOrderKey(null);
        setPaymentModalOpen(false);
        if (isMobile) toggleCart();

        toast.success("Order queued for sync", {
          id: idempotencyKey,
          description: "Order will be processed when connection is restored.",
        });
      }
    } catch (error) {
      console.error("Order placement failed:", error);

      if (isOnline) {
        toast.error("Order Failed", {
          id: idempotencyKey,
          description:
            error?.message || "Failed to place order. Please try again.",
        });
      } else {
        try {
          const orderData = prepareOrderData(
            orderItems,
            totals,
            orgSettings,
            { customerName, paymentMethod, mobileNumber, deliveryType, tip },
            idempotencyKey
          );
          addOrder(orderData);
          toast.success("Order queued for sync", {
            id: idempotencyKey,
            description: "Order will be processed when connection is restored.",
          });
          clearCart();
          setPendingOrderKey(null);
          setPaymentModalOpen(false);
          if (isMobile) toggleCart();
        } catch {
          toast.error("Failed to queue order", {
            id: idempotencyKey,
            description: "Please try again when connection is restored.",
          });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const showSettingsError = settingsError && !settings;
  const showSettingsLoading = settingsLoading && !settings;

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
              isLoading={showSettingsLoading}
              hasError={showSettingsError}
              onRetrySettings={refetchSettings}
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
        total={totals?.total ?? 0}
        onConfirm={handlePlaceOrder}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
