import { z } from "zod";
import { organizationBaseSchema } from "./base-schema";
import { PAYMENT_METHODS } from "@/constants";

export const transactionSchema = organizationBaseSchema.extend({
  orderId: z.string().optional(),
  // transactionNumber is generated in the model
  type: z.enum(["payment", "refund", "adjustment", "cash_drawer"]),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  paymentMethod: z.enum(PAYMENT_METHODS),
  status: z
    .enum(["completed", "pending", "failed", "cancelled"])
    .default("completed"),
  reference: z.string().trim().optional(),
});
