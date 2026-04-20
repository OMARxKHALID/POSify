import { z } from "zod";
import { baseSchema, auditSchema } from "@/schemas/base.schema";
import { USER_ROLES, USER_STATUSES } from "@/features/users/constants/users.constants";

export const userSchema = baseSchema.extend({
  name: z.string().min(1, "Name is required").trim(),
  email: z.string().email("Invalid email format").toLowerCase().trim(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  role: z.enum(USER_ROLES, {
    errorMap: () => ({
      message: "Role must be super_admin, admin, staff or pending",
    }),
  }),
  organizationId: z.string().optional(),
  status: z.enum(USER_STATUSES).default("active"),
  permissions: z.array(z.string()).default([]),
  permissionsUpdatedAt: z.coerce.date().optional().nullable(),
  phone: z.string().trim().default(""),
  profileImage: z.string().trim().default(""),
  lastLogin: z.coerce.date().optional().nullable(),
  emailVerified: z.boolean().default(false),
  inviteToken: z.string().trim().optional(),
  inviteAcceptedAt: z.coerce.date().optional(),
  ...auditSchema.shape,
});
