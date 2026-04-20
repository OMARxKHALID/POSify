import { useState } from "react";
import { useCartStore } from "@/components/providers/store-provider";
import { useShallow } from "zustand/react/shallow";
import { useSettings } from "@/features/settings/hooks/use-settings";
import { useCartCalculations } from "@/features/pos/hooks/use-cart-calculations";
import { usePlaceOrder } from "@/features/pos/hooks/use-place-order";
import { PaymentModal } from "./payment-modal";
import { DiscountModal } from "./discount-modal";
import { CartHeader } from "./cart-header";
import { CartFooter } from "./cart-footer";
import { CartItemsList } from "./cart-items-list";

export function OrderCart({ toggleCart, isMobile = false }) {
  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const {
    orderItems,
    cartDiscount,
    updateQuantity,
    removeFromCart,
    clearCart,
    removeCartDiscount,
    getTotalQuantity,
  } = useCartStore(
    useShallow((state) => ({
      orderItems: state.orderItems,
      cartDiscount: state.cartDiscount,
      getTotalQuantity: state.getTotalQuantity,
      updateQuantity: state.updateQuantity,
      removeFromCart: state.removeFromCart,
      clearCart: state.clearCart,
      removeCartDiscount: state.removeCartDiscount,
    })),
  );

  const {
    data: settings,
    isLoading: settingsLoading,
    error: settingsError,
    refetch: refetchSettings,
  } = useSettings();

  const { placeOrder, isSubmitting } = usePlaceOrder({
    onOrderSuccess: () => {
      setPaymentModalOpen(false);
      if (isMobile) toggleCart();
    },
  });

  const currency = settings?.currency || "USD";
  const hasItems = orderItems.length > 0;
  const totalItems = getTotalQuantity();
  const totals = useCartCalculations(orderItems, cartDiscount, settings?.taxes);

  const handlePlaceOrder = (customerName, paymentMethod, mobileNumber, deliveryType, tip) => {
    placeOrder({ customerName, paymentMethod, mobileNumber, deliveryType, tip });
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
