import { z } from "zod";
import {
  organizationBaseSchema,
  createSchema,
  updateSchema,
  querySchema,
  paginatedResponseSchema,
  singleItemResponseSchema,
} from "./base-schema.js";
import {
  PAYMENT_METHODS,
  ORDER_STATUSES,
  DELIVERY_TYPES,
  DELIVERY_STATUSES,
  REFUND_STATUSES,
  ORDER_SOURCES,
  TAX_TYPES,
  DEFAULT_PREP_TIME,
  DEFAULT_CUSTOMER_NAME,
} from "@/constants";

/**
 * Order item schema
 */
export const orderItemSchema = z.object({
  menuItem: z.string().min(1, "Menu item is required"),
  name: z.string().min(1, "Item name is required").trim(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  price: z.number().min(0, "Price must be non-negative"),
  discount: z.number().min(0).default(0),
  prepTime: z.number().min(0).default(DEFAULT_PREP_TIME),
  specialInstructions: z.string().trim().optional(),
  bulkPriceApplied: z.boolean().default(false),
});

/**
 * Tax schema
 */
export const taxSchema = z.object({
  id: z.string().min(1, "Tax ID is required"),
  name: z.string().min(1, "Tax name is required").trim(),
  rate: z.number().min(0, "Tax rate must be non-negative"),
  type: z.enum(TAX_TYPES, { required_error: "Tax type is required" }),
  amount: z.number().min(0, "Tax amount must be non-negative"),
});

/**
 * Customer schema
 */
export const customerSchema = z.object({
  name: z.string().trim().default(DEFAULT_CUSTOMER_NAME),
  phone: z.string().trim().optional(),
  email: z.string().email().toLowerCase().trim().optional(),
  address: z.string().trim().optional(),
});

/**
 * Payment schema
 */
export const paymentSchema = z.object({
  method: z.enum(PAYMENT_METHODS, {
    required_error: "Payment method is required",
  }),
  amount: z.number().min(0, "Payment amount must be non-negative"),
  transactionId: z.string().trim().optional(),
  status: z.enum(["pending", "completed", "failed"]).default("pending"),
  notes: z.string().trim().optional(),
});

/**
 * Return item schema
 */
export const returnItemSchema = z.object({
  itemId: z.string().min(1, "Item ID is required"),
  quantity: z.number().min(1, "Return quantity must be at least 1"),
  amount: z.number().min(0, "Return amount must be non-negative"),
  reason: z.string().trim().optional(),
  returnedAt: z.date().default(() => new Date()),
  processedBy: z.string().optional(),
});

/**
 * Delivery information schema
 */
export const deliveryInfoSchema = z.object({
  address: z.string().trim().optional(),
  deliveryCharge: z.number().min(0).default(0),
  estimatedDeliveryTime: z.date().optional(),
  deliveryStatus: z.enum(DELIVERY_STATUSES).default("pending"),
  deliveryPartner: z.string().trim().optional(),
});

/**
 * Kitchen information schema
 */
export const kitchenInfoSchema = z.object({
  prepStartTime: z.date().optional(),
  prepCompleteTime: z.date().optional(),
  estimatedPrepTime: z.number().optional(),
  kitchenNotes: z.string().trim().optional(),
});

/**
 * Manager approval schema
 */
export const managerApprovalSchema = z.object({
  required: z.boolean().default(false),
  approvedBy: z.string().optional(),
  approvedAt: z.date().optional(),
  reason: z.string().trim().optional(),
});

/**
 * Order schema
 * Aligns with the Mongoose Order model
 */
export const orderSchema = organizationBaseSchema.extend({
  // Required fields
  orderNumber: z.string().min(1, "Order number is required"),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
  subtotal: z.number().min(0, "Subtotal must be non-negative"),
  total: z.number().min(0, "Total must be non-negative"),
  paymentMethod: z.enum(PAYMENT_METHODS, {
    required_error: "Payment method is required",
  }),

  // Optional fields
  customerName: z.string().trim().default(DEFAULT_CUSTOMER_NAME),
  mobileNumber: z.string().trim().optional(),
  tableNumber: z.string().trim().optional(),
  status: z.enum(ORDER_STATUSES).default("pending"),
  deliveryType: z.enum(DELIVERY_TYPES).default("dine-in"),
  servedBy: z.string().optional(), // User ID reference

  // Tax and fees
  tax: z.array(taxSchema).default([]),
  discount: z.number().min(0).default(0),
  promoDiscount: z.number().min(0).default(0),
  couponCode: z.string().trim().optional(),
  serviceCharge: z.number().min(0).default(0),
  tip: z.number().min(0).default(0),

  // Payment and refund
  isPaid: z.boolean().default(false),
  refundStatus: z.enum(REFUND_STATUSES).default("none"),
  returns: z.array(returnItemSchema).default([]),

  // Delivery information
  deliveryInfo: z
    .object({
      address: z.string().trim().optional(),
      deliveryCharge: z.number().min(0).default(0),
      estimatedDeliveryTime: z.date().optional(),
      deliveryStatus: z.enum(DELIVERY_STATUSES).default("pending"),
      deliveryPartner: z.string().trim().optional(),
    })
    .default({}),

  // Kitchen information
  kitchenInfo: z
    .object({
      prepStartTime: z.date().optional(),
      prepCompleteTime: z.date().optional(),
      estimatedPrepTime: z.number().optional(),
      kitchenNotes: z.string().trim().optional(),
    })
    .default({}),

  // Manager approval
  managerApproval: z
    .object({
      required: z.boolean().default(false),
      approvedBy: z.string().optional(),
      approvedAt: z.date().optional(),
      reason: z.string().trim().optional(),
    })
    .default({}),

  // Order details
  source: z.enum(ORDER_SOURCES).default("pos"),
  notes: z.string().trim().optional(),
  idempotencyKey: z.string().trim().optional(),
});

/**
 * Create order schema
 */
export const createOrderSchema = createSchema(orderSchema).omit({
  orderNumber: true,
  status: true,
  orderTime: true,
  readyTime: true,
  servedTime: true,
  paidTime: true,
  actualDeliveryTime: true,
  createdBy: true,
  lastModifiedBy: true,
});

/**
 * Update order schema
 */
export const updateOrderSchema = updateSchema(orderSchema).omit({
  orderNumber: true,
  organizationId: true,
  orderTime: true,
  createdBy: true,
});

/**
 * Order query schema
 */
export const orderQuerySchema = querySchema({
  status: z.enum(ORDER_STATUSES).optional(),
  deliveryType: z.enum(DELIVERY_TYPES).optional(),
  source: z.enum(ORDER_SOURCES).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  minTotal: z.number().min(0).optional(),
  maxTotal: z.number().min(0).optional(),
});

/**
 * Order response schema
 */
export const orderResponseSchema = orderSchema;

/**
 * Order list response schema
 */
export const orderListResponseSchema =
  paginatedResponseSchema(orderResponseSchema);

/**
 * Order single response schema
 */
export const orderSingleResponseSchema =
  singleItemResponseSchema(orderResponseSchema);

/**
 * Order statistics schema
 */
export const orderStatsSchema = z.object({
  totalOrders: z.number(),
  totalRevenue: z.number(),
  averageOrderValue: z.number(),
  ordersByStatus: z.record(z.number()),
  ordersByPaymentMethod: z.record(z.number()),
  ordersByDeliveryType: z.record(z.number()),
  topSellingItems: z.array(
    z.object({
      itemId: z.string(),
      name: z.string(),
      quantity: z.number(),
      revenue: z.number(),
    })
  ),
});

/**
 * Order status update schema
 */
export const orderStatusUpdateSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  orderId: z.string().min(1, "Order ID is required"),
  status: z.enum(ORDER_STATUSES),
  notes: z.string().trim().optional(),
});

/**
 * Order payment schema
 */
export const orderPaymentSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  orderId: z.string().min(1, "Order ID is required"),
  paymentMethod: z.enum(PAYMENT_METHODS),
  amount: z.number().min(0, "Payment amount must be non-negative"),
  tip: z.number().min(0).default(0),
  notes: z.string().trim().optional(),
});

/**
 * Order return schema
 */
export const orderReturnSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  orderId: z.string().min(1, "Order ID is required"),
  items: z.array(
    z.object({
      itemId: z.string().min(1, "Item ID is required"),
      quantity: z.number().min(1, "Return quantity must be at least 1"),
      reason: z.string().trim().optional(),
    })
  ),
  refundMethod: z.enum(PAYMENT_METHODS).optional(),
  notes: z.string().trim().optional(),
});
