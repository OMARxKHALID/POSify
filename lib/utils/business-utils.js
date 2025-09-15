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
      return total + (subtotal * tax.rate) / 100;
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
      name: tax.name,
      rate: tax.rate,
      amount: (subtotal * tax.rate) / 100,
    }));
}

/**
 * Calculate item original price (before discounts)
 */
export function calculateItemOriginalPrice(item) {
  return item.price * item.quantity;
}

/**
 * Calculate item final price (after discounts)
 */
export function calculateItemFinalPrice(item) {
  const originalPrice = calculateItemOriginalPrice(item);
  const itemDiscount = item.discount || 0;
  const discountAmount = (originalPrice * itemDiscount) / 100;
  return originalPrice - discountAmount;
}

/**
 * Calculate cart total with taxes and discounts
 */
export function calculateCartTotal(orderItems, taxSettings, cartDiscount = 0) {
  const subtotal = orderItems.reduce((sum, item) => {
    return sum + calculateItemFinalPrice(item);
  }, 0);

  const cartDiscountAmount = (subtotal * cartDiscount) / 100;
  const discountedSubtotal = subtotal - cartDiscountAmount;
  const taxAmount = calculateTaxAmountWithTaxes(
    discountedSubtotal,
    taxSettings
  );

  return {
    subtotal,
    cartDiscountAmount,
    discountedSubtotal,
    taxAmount,
    total: discountedSubtotal + taxAmount,
  };
}
