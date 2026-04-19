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

export const getOrderStatusInfo = (status) => {
  const statusMap = {
    pending: { variant: "secondary", icon: Clock, color: "text-yellow-600" },
    confirmed: {
      variant: "default",
      icon: CheckCircle,
      color: "text-blue-600",
    },
    preparing: { variant: "default", icon: Utensils, color: "text-orange-600" },
    ready: { variant: "default", icon: CheckCircle, color: "text-green-600" },
    completed: {
      variant: "default",
      icon: CheckCircle,
      color: "text-green-600",
    },
    delivered: { variant: "default", icon: Truck, color: "text-green-600" },
    served: { variant: "default", icon: Utensils, color: "text-green-600" },
    paid: { variant: "default", icon: CreditCard, color: "text-indigo-600" },
    cancelled: { variant: "destructive", icon: XCircle, color: "text-red-600" },
    refund: { variant: "outline", icon: AlertCircle, color: "text-gray-600" },
    refunded: { variant: "outline", icon: AlertCircle, color: "text-gray-600" },
    "partial refund": {
      variant: "outline",
      icon: AlertCircle,
      color: "text-gray-600",
    },
  };
  return statusMap[status] || statusMap.pending;
};

export const getPaymentMethodInfo = (method) => {
  const methodMap = {
    cash: { icon: DollarSign, label: "Cash" },
    card: { icon: CreditCard, label: "Card" },
    digital: { icon: CreditCard, label: "Digital" },
    check: { icon: CreditCard, label: "Check" },
  };
  return methodMap[method] || methodMap.card;
};

export const getDeliveryTypeInfo = (type) => {
  const typeMap = {
    "dine-in": { icon: Utensils, label: "Dine In" },
    takeout: { icon: Utensils, label: "Takeout" },
    delivery: { icon: Truck, label: "Delivery" },
    "drive-thru": { icon: Truck, label: "Drive Thru" },
  };
  return typeMap[type] || typeMap["dine-in"];
};

export const getAuditActionVariant = (action) => {
  if (action.includes("CREATE")) return "default";
  if (action.includes("UPDATE")) return "secondary";
  if (action.includes("DELETE")) return "destructive";
  if (action.includes("LOGIN") || action.includes("LOGOUT")) return "outline";
  return "secondary";
};

export const getAuditResourceVariant = (resource) => {
  switch (resource.toLowerCase()) {
    case "user":
      return "default";
    case "order":
      return "secondary";
    case "product":
      return "outline";
    case "organization":
      return "destructive";
    default:
      return "secondary";
  }
};

export const formatOrderDate = (date) => ({
  date: format(new Date(date), "MMM dd, yyyy"),
  time: format(new Date(date), "HH:mm"),
});

export const calculateOrderStats = (orders) => {
  const today = new Date();
  const todayOrders = orders.filter((order) => {
    return new Date(order.createdAt).toDateString() === today.toDateString();
  });

  return {
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.status === "pending").length,
    completedOrders: orders.filter((o) => o.status === "completed").length,
    todayRevenue: todayOrders.reduce((sum, o) => sum + o.total, 0),
  };
};

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
