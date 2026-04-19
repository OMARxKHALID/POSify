import { z } from "zod";
import { organizationBaseSchema } from "@/schemas/base.schema";
import { DEFAULT_CUSTOMER_NAME } from "@/features/pos/constants/orders.constants";
import { DELIVERY_STATUSES, REFUND_STATUSES } from "@/features/pos/constants/orders.constants";
import { DELIVERY_TYPES, ORDER_STATUSES, PAYMENT_METHODS } from "@/features/pos/constants/orders.constants";
import { TAX_TYPES } from "@/features/pos/constants/orders.constants";
import { DEFAULT_PREP_TIME } from "@/features/menu/constants/menu-categories.constants";

export const orderItemSchema = z.object({
  menuItem: z.string().min(1, "Menu item is required"),
  name: z.string().min(1, "Item name is required").trim(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  price: z.number().min(0, "Price must be non-negative"),
  discount: z.number().min(0).default(0),
  prepTime: z.number().min(0).default(DEFAULT_PREP_TIME),
});

export const taxSchema = z.object({
  id: z.string().min(1, "Tax ID is required"),
  name: z.string().min(1, "Tax name is required").trim(),
  rate: z.number().min(0, "Tax rate must be non-negative"),
  type: z.enum(TAX_TYPES, { required_error: "Tax type is required" }),
  amount: z.number().min(0, "Tax amount must be non-negative"),
});

export const returnItemSchema = z.object({
  itemId: z.string().min(1, "Item ID is required"),
  quantity: z.number().min(1, "Return quantity must be at least 1"),
  amount: z.number().min(0, "Return amount must be non-negative"),
  reason: z.string().trim().optional(),
  returnedAt: z.date().default(() => new Date()),
  processedBy: z.string().optional(),
});

export const deliveryInfoSchema = z.object({
  address: z.string().trim().optional(),
  deliveryCharge: z.number().min(0).default(0),
  estimatedDeliveryTime: z.date().optional(),
  deliveryStatus: z.enum(DELIVERY_STATUSES).default("pending"),
  deliveryPartner: z.string().trim().optional(),
});

export const paymentFormSchema = z.object({
  customerName: z.string().trim().default("Guest"),
  paymentMethod: z.enum(PAYMENT_METHODS, {
    required_error: "Payment method is required",
  }),
  mobileNumber: z.string().trim().optional(),
  deliveryType: z.enum(DELIVERY_TYPES).default("dine-in"),
  tip: z.number().min(0).default(0),
});

export const discountFormSchema = z
  .object({
    discountType: z.enum(["percentage", "fixed"]).default("percentage"),
    discountValue: z.number().min(0, "Discount value must be non-negative"),
  })
  .refine(
    (data) => {
      if (data.discountType === "percentage") {
        return data.discountValue <= 100;
      }
      return true;
    },
    {
      message: "Percentage discount cannot exceed 100%",
      path: ["discountValue"],
    },
  );

export const orderSchema = organizationBaseSchema.extend({
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
  subtotal: z.number().min(0, "Subtotal must be non-negative"),
  total: z.number().min(0, "Total must be non-negative"),
  paymentMethod: z.enum(PAYMENT_METHODS, {
    required_error: "Payment method is required",
  }),
  customerName: z.string().trim().default(DEFAULT_CUSTOMER_NAME),
  mobileNumber: z.string().trim().optional(),
  status: z.enum(ORDER_STATUSES).default("pending"),
  deliveryType: z.enum(DELIVERY_TYPES).default("dine-in"),
  servedBy: z.string().optional(),
  tax: z.array(taxSchema).default([]),
  discount: z.number().min(0).default(0),
  promoDiscount: z.number().min(0).default(0),
  serviceCharge: z.number().min(0).default(0),
  tip: z.number().min(0).default(0),
  isPaid: z.boolean().default(false),
  refundStatus: z.enum(REFUND_STATUSES).default("none"),
  returns: z.array(returnItemSchema).default([]),
  deliveryInfo: deliveryInfoSchema.default({}),
  idempotencyKey: z.string().trim().optional(),
});
