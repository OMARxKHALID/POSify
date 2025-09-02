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
  menuItem: z.string().min(1, "Menu item ID is required"),
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
  id: z.string().min(1, "Tax ID is required").trim(),
  name: z.string().min(1, "Tax name is required").trim(),
  rate: z.number().min(0, "Tax rate must be non-negative"),
  type: z.enum(TAX_TYPES),
  amount: z.number().min(0, "Tax amount must be non-negative"),
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
  items: z.array(orderItemSchema).min(1, "Order must have at least one item"),
  orderNumber: z.string().min(1, "Order number is required").trim(),
  subtotal: z.number().min(0, "Subtotal must be non-negative"),
  total: z.number().min(0, "Total must be non-negative"),
  paymentMethod: z.enum(PAYMENT_METHODS),

  // Optional fields
  customerName: z.string().trim().default(DEFAULT_CUSTOMER_NAME),
  mobileNumber: z.string().trim().optional(),
  tableNumber: z.string().trim().optional(),
  deliveryType: z.enum(DELIVERY_TYPES).default("dine-in"),
  servedBy: z.string().optional(),
  tax: z.array(taxSchema).default([]),
  discount: z.number().min(0).default(0),
  promoDiscount: z.number().min(0).default(0),
  couponCode: z.string().trim().optional(),
  serviceCharge: z.number().min(0).default(0),
  tip: z.number().min(0).default(0),
  isPaid: z.boolean().default(false),
  status: z.enum(ORDER_STATUSES).default("pending"),
  returns: z.array(returnItemSchema).default([]),
  refundStatus: z.enum(REFUND_STATUSES).default("none"),
  notes: z.string().trim().optional(),
  source: z.enum(ORDER_SOURCES).default("pos"),

  // Delivery information
  deliveryInfo: deliveryInfoSchema.default({}),

  // Kitchen information
  kitchenInfo: kitchenInfoSchema.default({}),

  // Manager approval
  managerApproval: managerApprovalSchema.default({}),

  idempotencyKey: z.string().trim().optional(),
});

/**
 * Create order schema
 */
export const createOrderSchema = createSchema(orderSchema).omit({
  orderNumber: true, // Auto-generated
  isPaid: true,
  returns: true,
  refundStatus: true,
  deliveryInfo: true,
  kitchenInfo: true,
  managerApproval: true,
  idempotencyKey: true,
});

/**
 * Update order schema
 */
export const updateOrderSchema = updateSchema(orderSchema).omit({
  orderNumber: true,
  items: true, // Items should be updated separately
  subtotal: true, // Auto-calculated
  total: true, // Auto-calculated
});

/**
 * Order query schema
 */
export const orderQuerySchema = querySchema({
  status: z.enum(ORDER_STATUSES).optional(),
  deliveryType: z.enum(DELIVERY_TYPES).optional(),
  paymentMethod: z.enum(PAYMENT_METHODS).optional(),
  servedBy: z.string().optional(),
  isPaid: z.boolean().optional(),
  customerName: z.string().trim().optional(),
  orderNumber: z.string().trim().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
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
