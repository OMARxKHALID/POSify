/**
 * Order utility functions for consistent formatting and display
 */

import { format } from "date-fns";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Truck,
  Utensils,
  DollarSign,
  CreditCard,
} from "lucide-react";

/**
 * Get status badge variant and icon for orders
 */
export const getOrderStatusInfo = (status) => {
  const statusMap = {
    pending: { variant: "secondary", icon: Clock, color: "text-yellow-600" },
    confirmed: {
      variant: "default",
      icon: CheckCircle,
      color: "text-blue-600",
    },
    preparing: {
      variant: "default",
      icon: Utensils,
      color: "text-orange-600",
    },
    ready: { variant: "default", icon: CheckCircle, color: "text-green-600" },
    completed: {
      variant: "default",
      icon: CheckCircle,
      color: "text-green-600",
    },
    cancelled: {
      variant: "destructive",
      icon: XCircle,
      color: "text-red-600",
    },
    refunded: {
      variant: "outline",
      icon: AlertCircle,
      color: "text-gray-600",
    },
  };
  return statusMap[status] || statusMap.pending;
};

/**
 * Get payment method info for orders
 */
export const getPaymentMethodInfo = (method) => {
  const methodMap = {
    cash: { icon: DollarSign, label: "Cash" },
    card: { icon: CreditCard, label: "Card" },
    digital: { icon: CreditCard, label: "Digital" },
    check: { icon: CreditCard, label: "Check" },
  };
  return methodMap[method] || methodMap.card;
};

/**
 * Get delivery type info for orders
 */
export const getDeliveryTypeInfo = (type) => {
  const typeMap = {
    "dine-in": { icon: Utensils, label: "Dine In" },
    takeout: { icon: Utensils, label: "Takeout" },
    delivery: { icon: Truck, label: "Delivery" },
    "drive-thru": { icon: Truck, label: "Drive Thru" },
  };
  return typeMap[type] || typeMap["dine-in"];
};

/**
 * Format order data for API response
 */
export const formatOrderData = (order) => ({
  id: order._id,
  organizationId: order.organizationId,
  orderNumber: order.orderNumber,
  items: order.items,
  customerName: order.customerName,
  mobileNumber: order.mobileNumber,
  tableNumber: order.tableNumber,
  deliveryType: order.deliveryType,
  servedBy: order.servedBy,
  subtotal: order.subtotal,
  total: order.total,
  paymentMethod: order.paymentMethod,
  isPaid: order.isPaid,
  status: order.status,
  refundStatus: order.refundStatus,
  returns: order.returns,
  notes: order.notes,
  source: order.source,
  deliveryInfo: order.deliveryInfo,
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
});

/**
 * Format date for display
 */
export const formatOrderDate = (date) => {
  return {
    date: format(new Date(date), "MMM dd, yyyy"),
    time: format(new Date(date), "HH:mm"),
  };
};

/**
 * Calculate order statistics
 */
export const calculateOrderStats = (orders) => {
  const today = new Date();
  const todayOrders = orders.filter((order) => {
    const orderDate = new Date(order.createdAt);
    return orderDate.toDateString() === today.toDateString();
  });

  return {
    totalOrders: orders.length,
    pendingOrders: orders.filter((order) => order.status === "pending").length,
    completedOrders: orders.filter((order) => order.status === "completed")
      .length,
    todayRevenue: todayOrders.reduce((sum, order) => sum + order.total, 0),
  };
};

/**
 * Filter orders by multiple criteria
 */
export const filterOrders = (orders, filters) => {
  const { status, paymentMethod, deliveryType, search } = filters;

  return orders.filter((order) => {
    if (status && status !== "all" && order.status !== status) return false;
    if (
      paymentMethod &&
      paymentMethod !== "all" &&
      order.paymentMethod !== paymentMethod
    )
      return false;
    if (
      deliveryType &&
      deliveryType !== "all" &&
      order.deliveryType !== deliveryType
    )
      return false;
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        order.orderNumber.toLowerCase().includes(searchLower) ||
        order.customerName.toLowerCase().includes(searchLower) ||
        order.mobileNumber?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });
};
