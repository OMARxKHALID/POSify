import { useState } from "react";
import { useSession } from "@/lib/mock-auth";
import { toast } from "sonner";
import { useCartStore, useOrderQueueStore } from "@/components/providers/store-provider";
import { useShallow } from "zustand/react/shallow";
import { useSettings } from "@/features/settings/hooks/use-settings";
import { useCreateOrder } from "@/features/pos/hooks/use-orders";
import { useCartCalculations } from "@/features/pos/hooks/use-cart-calculations";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { generateIdempotencyKey } from "@/lib/utils/common.utils";
import { prepareOrderData, validateOrderPrerequisites } from "../utils/order-data.utils";

export const usePlaceOrder = (options = {}) => {
  const { onOrderSuccess } = options;
  const [pendingOrderKey, setPendingOrderKey] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    orderItems,
    cartDiscount,
    clearCart,
  } = useCartStore(
    useShallow((state) => ({
      orderItems: state.orderItems,
      cartDiscount: state.cartDiscount,
      clearCart: state.clearCart,
    })),
  );

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
  const totals = useCartCalculations(orderItems, cartDiscount, settings?.taxes);

  const placeOrder = async (customerData) => {
    const validation = validateOrderPrerequisites(
      orderItems,
      status,
      settingsLoading,
      settingsError,
    );
    
    if (!validation.isValid) {
      toast.error(validation.error);
      return false;
    }

    if (isSubmitting) return false;

    let orgSettings = settings;
    if (!settings?.organizationId) {
      try {
        const result = await refetchSettings();
        if (!result?.data?.organizationId) {
          toast.error("Organization not found. Please refresh and try again.");
          return false;
        }
        orgSettings = result.data;
      } catch {
        toast.error("Organization not found. Please refresh and try again.");
        return false;
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
        customerData,
        idempotencyKey,
      );

      if (isOnline) {
        await createOrder.mutateAsync(orderData);
        clearCart();
        setPendingOrderKey(null);
        onOrderSuccess?.();
        return true;
      } else {
        addOrder(orderData);
        clearCart();
        setPendingOrderKey(null);
        onOrderSuccess?.();
        
        toast.success("Order queued for sync", {
          id: idempotencyKey,
          description: "Order will be processed when connection is restored.",
        });
        return true;
      }
    } catch (error) {
      console.error("Order placement failed:", error);

      if (isOnline) {
        toast.error("Order Failed", {
          id: idempotencyKey,
          description: error?.message || "Failed to place order. Please try again.",
        });
      } else {
        try {
          const orderData = prepareOrderData(
            orderItems,
            totals,
            orgSettings,
            customerData,
            idempotencyKey,
          );
          addOrder(orderData);
          toast.success("Order queued for sync", {
            id: idempotencyKey,
            description: "Order will be processed when connection is restored.",
          });
          clearCart();
          setPendingOrderKey(null);
          onOrderSuccess?.();
          return true;
        } catch {
          toast.error("Failed to queue order", {
            id: idempotencyKey,
            description: "Please try again when connection is restored.",
          });
        }
      }
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    placeOrder,
    isSubmitting,
    pendingOrderKey,
  };
};
