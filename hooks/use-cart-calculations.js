

import { useMemo } from "react";
import {
  calculateCartTotal,
  getTaxBreakdown,
} from "@/lib/utils/business-utils";


export const useCartCalculations = (orderItems, cartDiscount, taxes) => {
  return useMemo(() => {

    if (!orderItems || orderItems.length === 0) {
      return {
        subtotal: 0,
        itemDiscounts: 0,
        discount: 0,
        tax: 0,
        total: 0,
        subtotalAfterDiscounts: 0,
        taxBreakdown: [],
      };
    }

    const cartTotal = calculateCartTotal(orderItems, taxes, cartDiscount);
    const itemDiscounts = orderItems.reduce(
      (sum, item) =>
        sum + item.price * item.quantity * ((item.discount || 0) / 100),
      0
    );

    const subtotalAfterDiscounts =
      cartTotal.subtotal - itemDiscounts - cartTotal.cartDiscountAmount;
    const taxBreakdown = getTaxBreakdown(subtotalAfterDiscounts, taxes);

    return {
      subtotal: cartTotal.subtotal,
      itemDiscounts,
      discount: cartTotal.cartDiscountAmount,
      tax: cartTotal.taxAmount,
      total: cartTotal.total,
      subtotalAfterDiscounts,
      taxBreakdown,
    };
  }, [orderItems, cartDiscount, taxes]);
};
