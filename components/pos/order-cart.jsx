"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useCartStore } from "@/lib/store/use-cart-store";
import { useSettings } from "@/hooks/use-settings";
import { useCreateOrder } from "@/hooks/use-orders";
import {
  calculateCartTotal,
  getTaxBreakdown,
} from "@/lib/utils/business-utils";
import { PaymentModal } from "./payment-modal";
import { DiscountModal } from "./discount-modal";
import { CartHeader } from "./cart-header";
import { CartFooter } from "./cart-footer";
import { CartItemsList } from "./cart-items-list";

function generateIdempotencyKey() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // fallback
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

  const { status, data: session } = useSession();
  const settingsQuery = useSettings();
  const {
    data: settings,
    isLoading: settingsLoading,
    error: settingsError,
    refetch: refetchSettings,
  } = settingsQuery;

  // Enhanced debugging for settings state
  console.log("🛒 [DEBUG] Order Cart - Settings Query State:", {
    data: settingsQuery.data,
    isLoading: settingsQuery.isLoading,
    isSuccess: settingsQuery.isSuccess,
    isError: settingsQuery.isError,
    error: settingsQuery.error,
    status: settingsQuery.status,
    fetchStatus: settingsQuery.fetchStatus,
    hasData: !!settingsQuery.data,
    dataKeys: settingsQuery.data ? Object.keys(settingsQuery.data) : [],
  });

  // Debug session and settings
  console.log("🛒 [DEBUG] Order Cart - Session and Settings:", {
    userRole: session?.user?.role,
    userId: session?.user?.id,
    settingsLoading,
    settingsError,
    hasSettings: !!settings,
    organizationId: settings?.organizationId,
    sessionStatus: status,
  });

  // Removed auto-refetch logic to prevent multiple API requests
  // React Query will handle the initial fetch automatically

  // Force re-render when settings change to ensure state synchronization
  useEffect(() => {
    if (settings && settings.organizationId) {
      console.log("🛒 [DEBUG] Order Cart - Settings updated:", {
        organizationId: settings.organizationId,
        hasSettings: !!settings,
        settingsKeys: Object.keys(settings),
      });
    }
  }, [settings]);

  const currency = settings?.currency || "USD";
  const createOrder = useCreateOrder();
  const hasItems = orderItems.length > 0;
  const totalItems = getTotalQuantity();

  const totals = useMemo(() => {
    console.log("🛒 [DEBUG] Order Cart - Calculating totals:", {
      orderItems: orderItems.map((item) => ({
        id: item._id || item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount,
      })),
      cartDiscount,
      taxes: settings?.taxes,
    });

    const calculatedTotals = calculateTotals(
      orderItems,
      cartDiscount,
      settings?.taxes
    );

    console.log("🛒 [DEBUG] Order Cart - Calculated totals:", calculatedTotals);

    return calculatedTotals;
  }, [orderItems, cartDiscount, settings?.taxes]);

  const handlePlaceOrder = useCallback(
    async (
      customerName,
      paymentMethod,
      mobileNumber,
      deliveryType,
      tableNumber,
      tip = 0
    ) => {
      console.log("🛒 [DEBUG] Order Cart - Starting order placement:", {
        customerName,
        paymentMethod,
        mobileNumber,
        deliveryType,
        tableNumber,
        tip,
        orderItemsCount: orderItems.length,
        authStatus: status,
        isSubmitting,
        settingsDebug: {
          hasSettings: !!settings,
          organizationId: settings?.organizationId,
          organizationName: settings?.organizationName,
          userRole: settings?.userRole,
          userId: settings?.userId,
          isAdmin: settings?.isAdmin,
          isStaff: settings?.isStaff,
          settingsKeys: settings ? Object.keys(settings) : [],
          settingsType: typeof settings,
        },
      });

      if (!orderItems.length) {
        console.log("🛒 [DEBUG] Order Cart - No items in cart, aborting");
        return;
      }
      if (status !== "authenticated") {
        console.log("🛒 [DEBUG] Order Cart - User not authenticated, aborting");
        toast.error("You must be logged in to place an order.");
        return;
      }
      if (isSubmitting) {
        console.log("🛒 [DEBUG] Order Cart - Already submitting, aborting");
        return;
      }
      if (settingsLoading) {
        console.log("🛒 [DEBUG] Order Cart - Settings still loading, aborting");
        toast.error("Settings are still loading. Please wait and try again.");
        return;
      }
      if (settingsError) {
        console.log("🛒 [DEBUG] Order Cart - Settings error:", settingsError);
        toast.error("Failed to load settings. Please refresh and try again.");
        return;
      }
      if (!settings?.organizationId) {
        console.log("🛒 [DEBUG] Order Cart - Missing organizationId:", {
          organizationId: settings?.organizationId,
          hasSettings: !!settings,
          settingsType: typeof settings,
          settingsValue: settings,
          organizationName: settings?.organizationName,
          userRole: settings?.userRole,
          userId: settings?.userId,
          isAdmin: settings?.isAdmin,
          isStaff: settings?.isStaff,
          settingsKeys: settings ? Object.keys(settings) : [],
        });

        // Try to refetch settings once and wait for the result
        if (!settingsLoading && !settingsError) {
          console.log("🛒 [DEBUG] Order Cart - Attempting to refetch settings");
          try {
            const refetchResult = await refetchSettings();
            console.log(
              "🛒 [DEBUG] Order Cart - Refetch result:",
              refetchResult
            );

            // Check if the refetch was successful and we now have organizationId
            if (refetchResult?.data?.organizationId) {
              console.log(
                "🛒 [DEBUG] Order Cart - Settings refetched successfully, using refetched data"
              );
              // Use the refetched data directly instead of recursive call
              const refetchedSettings = refetchResult.data;

              // Continue with order placement using refetched settings
              console.log(
                "🛒 [DEBUG] Order Cart - Settings validated (from refetch):",
                {
                  organizationId: refetchedSettings.organizationId,
                  currency: refetchedSettings.currency,
                  hasTaxes: !!refetchedSettings.taxes,
                  hasBusiness: !!refetchedSettings.business,
                }
              );

              setIsSubmitting(true);
              const idempotencyKey =
                pendingOrderKey || generateIdempotencyKey();
              setPendingOrderKey(idempotencyKey);

              console.log(
                "🛒 [DEBUG] Order Cart - Generated idempotency key:",
                idempotencyKey
              );

              const subtotalAfterDiscounts =
                totals.subtotal - totals.itemDiscounts - totals.discount;
              const taxBreakdown = getTaxBreakdown(
                subtotalAfterDiscounts,
                refetchedSettings?.taxes
              );

              const deliveryCharge =
                deliveryType === "delivery"
                  ? refetchedSettings?.operational?.deliverySettings
                      ?.deliveryCharge || 0
                  : 0;

              let serviceCharge = 0;
              if (refetchedSettings?.business?.serviceCharge?.enabled) {
                const base =
                  refetchedSettings.business.serviceCharge.applyOn === "total"
                    ? totals.total
                    : totals.subtotal;
                serviceCharge =
                  (refetchedSettings.business.serviceCharge.percentage / 100) *
                  base;
              }

              // Validate required data
              if (!orderItems || orderItems.length === 0) {
                console.log(
                  "🛒 [DEBUG] Order Cart - Validation failed: No items in cart"
                );
                throw new Error("No items in cart");
              }

              console.log("🛒 [DEBUG] Order Cart - Preparing order data:", {
                subtotalAfterDiscounts,
                taxBreakdown,
                deliveryCharge,
                serviceCharge,
                totals,
              });

              const orderData = {
                organizationId: refetchedSettings?.organizationId,
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
                total: Number(
                  totals.total + deliveryCharge + serviceCharge + tip
                ),
                paymentMethod,
                status:
                  refetchedSettings?.operational?.orderManagement
                    ?.defaultStatus || "pending",
                deliveryType: deliveryType || "dine-in",
                servedBy: null, // Will be populated by backend from session
                tax:
                  taxBreakdown && taxBreakdown.length > 0
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
                serviceCharge: Number(serviceCharge || 0),
                tip: Number(tip || 0),
                isPaid: false,
                refundStatus: "none",
                returns: [],
                deliveryInfo: {
                  address: "",
                  deliveryCharge: Number(deliveryCharge || 0),
                  estimatedDeliveryTime: undefined, // Optional field
                  deliveryStatus: "pending",
                  deliveryPartner: "",
                },
                notes: "",
                source: "pos",
                idempotencyKey,
              };

              console.log(
                "🛒 [DEBUG] Order Cart - Final order data prepared:",
                {
                  orderData: {
                    ...orderData,
                    items: orderData.items.map((item) => ({
                      menuItem: item.menuItem,
                      name: item.name,
                      quantity: item.quantity,
                      price: item.price,
                      discount: item.discount,
                    })),
                  },
                  settingsDebug: {
                    organizationId: refetchedSettings?.organizationId,
                    hasSettings: !!refetchedSettings,
                    settingsKeys: refetchedSettings
                      ? Object.keys(refetchedSettings)
                      : [],
                  },
                }
              );

              try {
                console.log(
                  "🛒 [DEBUG] Order Cart - Calling createOrder.mutateAsync with data:",
                  {
                    orderDataKeys: Object.keys(orderData),
                    organizationId: orderData.organizationId,
                    itemsCount: orderData.items?.length,
                    total: orderData.total,
                    customerName: orderData.customerName,
                    paymentMethod: orderData.paymentMethod,
                  }
                );

                const response = await createOrder.mutateAsync(orderData);
                console.log(
                  "🛒 [DEBUG] Order Cart - Order creation successful:",
                  response
                );
                clearCart();
                setPendingOrderKey(null);

                toast.success("Order completed successfully!", {
                  id: idempotencyKey,
                  description: `Order #${response?.orderNumber || "N/A"} for ${
                    customerName || "Guest"
                  }`,
                });

                // Close modal and cart immediately
                setPaymentModalOpen(false);
                if (isMobile) toggleCart();
              } catch (error) {
                console.error(
                  "🛒 [DEBUG] Order Cart - Order placement failed:",
                  {
                    error: error.message,
                    code: error.code,
                    statusCode: error.statusCode,
                    details: error.details,
                    fullError: error,
                    orderData: {
                      organizationId: orderData.organizationId,
                      itemsCount: orderData.items?.length,
                      total: orderData.total,
                      customerName: orderData.customerName,
                      paymentMethod: orderData.paymentMethod,
                    },
                    settingsDebug: {
                      hasSettings: !!refetchedSettings,
                      organizationId: refetchedSettings?.organizationId,
                      organizationName: refetchedSettings?.organizationName,
                      userRole: refetchedSettings?.userRole,
                      userId: refetchedSettings?.userId,
                    },
                  }
                );

                const errorMessage =
                  error?.message || "Failed to place order. Please try again.";
                toast.error("Order Failed", {
                  id: idempotencyKey,
                  description: errorMessage,
                });
              } finally {
                console.log(
                  "🛒 [DEBUG] Order Cart - Order placement process completed"
                );
                setIsSubmitting(false);
              }
            } else {
              toast.error(
                "Organization not found. Please refresh and try again."
              );
              return;
            }
          } catch (error) {
            console.error(
              "🛒 [DEBUG] Order Cart - Settings refetch failed:",
              error
            );
            toast.error(
              "Organization not found. Please refresh and try again."
            );
            return;
          }
        } else {
          toast.error("Organization not found. Please refresh and try again.");
          return;
        }
      }

      console.log("🛒 [DEBUG] Order Cart - Settings validated:", {
        organizationId: settings?.organizationId,
        currency: settings?.currency,
        hasTaxes: !!settings?.taxes,
        hasBusiness: !!settings?.business,
      });

      setIsSubmitting(true);
      const idempotencyKey = pendingOrderKey || generateIdempotencyKey();
      setPendingOrderKey(idempotencyKey);

      console.log(
        "🛒 [DEBUG] Order Cart - Generated idempotency key:",
        idempotencyKey
      );

      const subtotalAfterDiscounts =
        totals.subtotal - totals.itemDiscounts - totals.discount;
      const taxBreakdown = getTaxBreakdown(
        subtotalAfterDiscounts,
        settings?.taxes
      );

      const deliveryCharge =
        deliveryType === "delivery"
          ? settings?.operational?.deliverySettings?.deliveryCharge || 0
          : 0;

      let serviceCharge = 0;
      if (settings?.business?.serviceCharge?.enabled) {
        const base =
          settings.business.serviceCharge.applyOn === "total"
            ? totals.total
            : totals.subtotal;
        serviceCharge =
          (settings.business.serviceCharge.percentage / 100) * base;
      }

      // Validate required data
      if (!orderItems || orderItems.length === 0) {
        console.log(
          "🛒 [DEBUG] Order Cart - Validation failed: No items in cart"
        );
        throw new Error("No items in cart");
      }

      console.log("🛒 [DEBUG] Order Cart - Preparing order data:", {
        subtotalAfterDiscounts,
        taxBreakdown,
        deliveryCharge,
        serviceCharge,
        totals,
      });

      const orderData = {
        organizationId: settings?.organizationId,
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
          settings?.operational?.orderManagement?.defaultStatus || "pending",
        deliveryType: deliveryType || "dine-in",
        // servedBy: null, // Will be populated by backend from session
        tax:
          taxBreakdown && taxBreakdown.length > 0
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
        serviceCharge: Number(serviceCharge || 0),
        tip: Number(tip || 0),
        isPaid: false,
        refundStatus: "none",
        returns: [],
        deliveryInfo: {
          address: "",
          deliveryCharge: Number(deliveryCharge || 0),
          estimatedDeliveryTime: undefined, // Optional field
          deliveryStatus: "pending",
          deliveryPartner: "",
        },
        notes: "",
        source: "pos",
        idempotencyKey,
      };

      console.log("🛒 [DEBUG] Order Cart - Final order data prepared:", {
        orderData: {
          ...orderData,
          items: orderData.items.map((item) => ({
            menuItem: item.menuItem,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            discount: item.discount,
          })),
        },
        settingsDebug: {
          organizationId: settings?.organizationId,
          hasSettings: !!settings,
          settingsKeys: settings ? Object.keys(settings) : [],
        },
        fullOrderData: orderData,
      });

      try {
        console.log(
          "🛒 [DEBUG] Order Cart - Calling createOrder.mutateAsync with data:",
          {
            orderDataKeys: Object.keys(orderData),
            organizationId: orderData.organizationId,
            itemsCount: orderData.items?.length,
            total: orderData.total,
            customerName: orderData.customerName,
            paymentMethod: orderData.paymentMethod,
          }
        );

        const response = await createOrder.mutateAsync(orderData);
        console.log(
          "🛒 [DEBUG] Order Cart - Order creation successful:",
          response
        );
        clearCart();
        setPendingOrderKey(null);

        toast.success("Order completed successfully!", {
          id: idempotencyKey,
          description: `Order #${response?.orderNumber || "N/A"} for ${
            customerName || "Guest"
          }`,
        });

        // Close modal and cart immediately
        setPaymentModalOpen(false);
        if (isMobile) toggleCart();
      } catch (error) {
        console.error("🛒 [DEBUG] Order Cart - Order placement failed:", {
          error: error.message,
          code: error.code,
          statusCode: error.statusCode,
          details: error.details,
          fullError: error,
          orderData: {
            organizationId: orderData.organizationId,
            itemsCount: orderData.items?.length,
            total: orderData.total,
            customerName: orderData.customerName,
            paymentMethod: orderData.paymentMethod,
          },
          settingsDebug: {
            hasSettings: !!settings,
            organizationId: settings?.organizationId,
            organizationName: settings?.organizationName,
            userRole: settings?.userRole,
            userId: settings?.userId,
          },
        });

        const errorMessage =
          error?.message || "Failed to place order. Please try again.";
        toast.error("Order Failed", {
          id: idempotencyKey,
          description: errorMessage,
        });
      } finally {
        console.log(
          "🛒 [DEBUG] Order Cart - Order placement process completed"
        );
        setIsSubmitting(false);
      }
    },
    [
      orderItems,
      totals,
      isMobile,
      status,
      settings,
      toggleCart,
      createOrder,
      isSubmitting,
      pendingOrderKey,
      clearCart,
    ]
  );

  // Show loading state while settings are loading
  if (settingsLoading) {
    return (
      <div className="flex flex-col h-full min-h-0">
        <CartHeader
          totalItems={0}
          onClearCart={() => {}}
          onToggleCart={toggleCart}
          isMobile={isMobile}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-sm text-muted-foreground">
            Loading settings...
          </div>
        </div>
      </div>
    );
  }

  // Show error state if settings failed to load
  if (settingsError) {
    return (
      <div className="flex flex-col h-full min-h-0">
        <CartHeader
          totalItems={0}
          onClearCart={() => {}}
          onToggleCart={toggleCart}
          isMobile={isMobile}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-sm text-red-600">Failed to load settings</div>
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

const calculateTotals = (orderItems, cartDiscount, taxes) => {
  // Use the business utils for consistent calculation
  const cartTotal = calculateCartTotal(orderItems, taxes, cartDiscount);

  // Calculate item discounts for display
  const itemDiscounts = orderItems.reduce(
    (sum, item) =>
      sum + item.price * item.quantity * ((item.discount || 0) / 100),
    0
  );

  return {
    subtotal: cartTotal.subtotal,
    itemDiscounts,
    discount: cartTotal.cartDiscountAmount,
    tax: cartTotal.taxAmount,
    total: cartTotal.total,
  };
};
