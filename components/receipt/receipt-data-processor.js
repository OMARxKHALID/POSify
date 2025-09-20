import { formatCurrency } from "@/lib/utils/format-utils";
import { format } from "date-fns";
import { getTaxBreakdown } from "@/lib/utils/business-utils";

export class ReceiptDataProcessor {
  static processOrderData(
    orderData,
    enabledTaxes = [],
    currency = "USD",
    settings = {}
  ) {
    const breakdown = calculateOrderTotals(
      orderData.items || [],
      orderData.discount || 0
    );

    // Calculate tax breakdown for receipt
    const subtotalAfterDiscounts =
      breakdown.subtotal - breakdown.itemDiscounts - breakdown.discount;
    const taxBreakdown = getTaxBreakdown(subtotalAfterDiscounts, enabledTaxes);

    return {
      header: this.processHeader(orderData, settings),
      orderInfo: this.processOrderInfo(orderData),
      items: this.processItems(orderData.items || [], currency),
      totals: this.processTotals(breakdown, taxBreakdown, currency),
      footer: this.processFooter(settings),
      settings: settings, // Pass settings to the template
    };
  }

  static processHeader(orderData, settings = {}) {
    let dateTime = "-";
    if (orderData.createdAt) {
      try {
        const dateObj = new Date(orderData.createdAt);
        dateTime = format(dateObj, "yyyy-MM-dd HH:mm");
      } catch (e) {
        dateTime = orderData.createdAt;
      }
    }

    // Format address for display
    let formattedAddress = "";
    if (settings?.storeInformation?.address) {
      if (typeof settings.storeInformation.address === "string") {
        formattedAddress = settings.storeInformation.address;
      } else if (typeof settings.storeInformation.address === "object") {
        const addr = settings.storeInformation.address;
        const parts = [
          addr.street,
          addr.city,
          addr.state,
          addr.zipCode,
          addr.country,
        ].filter(Boolean);
        formattedAddress = parts.join(", ");
      }
    }

    return {
      restaurantName: settings?.storeInformation?.storeName || "RestaurantPOS",
      address: formattedAddress,
      phone: settings?.storeInformation?.phone || "",
      dateTime,
    };
  }

  static processOrderInfo(orderData) {
    return {
      orderNumber: orderData.orderNumber,
      receiptNumber:
        orderData.receiptNumber || orderData.transaction?.receiptNumber || null,
      customerName: orderData.customerName || "Guest",
      paymentMethod: orderData.paymentMethod
        ? capitalizeFirst(orderData.paymentMethod)
        : "Cash",
      mobileNumber: orderData.mobileNumber || "-",
      deliveryType: orderData.deliveryType || "-",
    };
  }

  static processItems(items, currency) {
    return items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: formatCurrency(item.price, currency),
      total: formatCurrency(calculateItemFinalPrice(item), currency),
      discount: item.discount || 0,
    }));
  }

  static processTotals(breakdown, taxBreakdown = [], currency) {
    return {
      subtotal: formatCurrency(breakdown.subtotal, currency),
      itemDiscounts:
        breakdown.itemDiscounts > 0
          ? formatCurrency(breakdown.itemDiscounts, currency)
          : null,
      cartDiscount:
        breakdown.discount > 0
          ? formatCurrency(breakdown.discount, currency)
          : null,
      tax: formatCurrency(breakdown.tax, currency),
      taxBreakdown: taxBreakdown.map((tax) => ({
        name: tax.name,
        rate: tax.rate,
        type: tax.type,
        amount: formatCurrency(tax.amount, currency),
      })),
      total: formatCurrency(breakdown.total, currency),
    };
  }

  static processFooter(settings = {}) {
    return {
      thankYou: settings?.receipt?.header || "Thank you for your order!",
      comeAgain: settings?.receipt?.footer || "Please come again",
    };
  }
}
