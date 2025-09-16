/**
 * Business logic utilities for calculations and operations
 */

/**
 * Calculate tax amount with multiple tax rates
 */
export function calculateTaxAmountWithTaxes(subtotal, taxSettings) {
  if (!taxSettings || !Array.isArray(taxSettings)) {
    return 0;
  }

  return taxSettings.reduce((total, tax) => {
    if (tax.enabled && tax.rate > 0) {
      return total + Number((subtotal * tax.rate) / 100);
    }
    return total;
  }, 0);
}

/**
 * Get tax breakdown for display
 */
export function getTaxBreakdown(subtotal, taxSettings) {
  if (!taxSettings || !Array.isArray(taxSettings)) {
    return [];
  }

  return taxSettings
    .filter((tax) => tax.enabled && tax.rate > 0)
    .map((tax) => ({
      id: tax.id || tax._id || `tax-${tax.name}`,
      name: tax.name,
      rate: Number(tax.rate),
      type: tax.type || "percentage",
      amount: Number((subtotal * tax.rate) / 100),
    }));
}

/**
 * Calculate item original price (before discounts)
 */
export function calculateItemOriginalPrice(item) {
  if (
    !item ||
    typeof item.price !== "number" ||
    typeof item.quantity !== "number"
  ) {
    console.warn("Invalid item for original price calculation:", item);
    return 0;
  }
  return item.price * item.quantity;
}

/**
 * Calculate item final price (after discounts)
 */
export function calculateItemFinalPrice(item) {
  if (
    !item ||
    typeof item.price !== "number" ||
    typeof item.quantity !== "number"
  ) {
    console.warn("Invalid item for price calculation:", item);
    return 0;
  }

  const originalPrice = calculateItemOriginalPrice(item);
  const itemDiscount = item.discount || 0;
  const discountAmount = (originalPrice * itemDiscount) / 100;
  return originalPrice - discountAmount;
}

/**
 * Calculate cart total with taxes and discounts
 */
export function calculateCartTotal(orderItems, taxSettings, cartDiscount = 0) {
  console.log("🧮 [DEBUG] Business Utils - calculateCartTotal called:", {
    orderItems: orderItems.map((item) => ({
      id: item._id || item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      discount: item.discount,
    })),
    taxSettings,
    cartDiscount,
  });

  const subtotal = orderItems.reduce((sum, item) => {
    return sum + calculateItemFinalPrice(item);
  }, 0);

  const cartDiscountAmount = (subtotal * cartDiscount) / 100;
  const discountedSubtotal = subtotal - cartDiscountAmount;
  const taxAmount = calculateTaxAmountWithTaxes(
    discountedSubtotal,
    taxSettings
  );

  const result = {
    subtotal,
    cartDiscountAmount,
    discountedSubtotal,
    taxAmount,
    total: discountedSubtotal + taxAmount,
  };

  console.log("🧮 [DEBUG] Business Utils - calculateCartTotal result:", result);
  return result;
}
