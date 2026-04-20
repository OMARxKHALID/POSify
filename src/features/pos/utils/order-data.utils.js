import { getTaxBreakdown } from "./business.utils";

export const prepareOrderData = (
  orderItems,
  totals,
  orgSettings,
  customerData,
  idempotencyKey,
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
    orgSettings?.taxes,
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
      menuItem: item._id,
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
    status: "paid",
    deliveryType: deliveryType || "dine-in",
    tax:
      taxBreakdown?.length > 0
        ? taxBreakdown.map((tax) => ({
            _id: tax._id || `tax-${tax.name.toLowerCase().replace(/\s+/g, "-")}`,
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
    isPaid: true,
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

export const validateOrderPrerequisites = (
  orderItems,
  status,
  settingsLoading,
  settingsError,
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
