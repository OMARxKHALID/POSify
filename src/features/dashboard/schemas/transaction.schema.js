import { z } from "zod";
import { organizationBaseSchema } from "@/schemas/base.schema";
import { PAYMENT_METHODS } from "@/features/pos/constants/orders.constants";

export const transactionSchema = organizationBaseSchema.extend({
  orderId: z.string().optional().nullable(),
  transactionNumber: z.string().optional(),
  type: z.enum(["payment", "refund", "adjustment", "cash_drawer"]),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  paymentMethod: z.enum(PAYMENT_METHODS),
  status: z
    .enum(["completed", "pending", "failed", "cancelled"])
    .default("completed"),
  reference: z.string().trim().optional().nullable(),
  processedBy: z.any().optional(),
  processedAt: z.coerce.date().optional(),
  receiptNumber: z.string().optional().nullable(),
});
