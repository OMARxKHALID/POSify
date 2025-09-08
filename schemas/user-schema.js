import { z } from "zod";
import { baseSchema, auditSchema } from "./base-schema";
import { USER_ROLES, USER_STATUSES } from "@/constants";

/**
 * User schema for both super admin and organization users
 * Aligns with the updated Mongoose User model
 */
export const userSchema = baseSchema.extend({
  // Required fields
  name: z.string().min(1, "Name is required").trim(),
  email: z.string().email("Invalid email format").toLowerCase().trim(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(USER_ROLES, {
    errorMap: () => ({
      message: "Role must be super_admin, admin, staff or pending",
    }),
  }),

  // Organization ID - only required for admin/staff users
  organizationId: z
    .string()
    .optional()
    .refine(
      (val, ctx) => {
        if (ctx.parent?.role !== "super_admin" && !val) {
          return false;
        }
        return true;
      },
      {
        message: "Organization ID is required for admin and staff users",
      }
    ),

  // Optional fields
  status: z.enum(USER_STATUSES).default("active"),
  permissions: z.array(z.string()).default([]),
  permissionsUpdatedAt: z.date().default(() => new Date()),
  phone: z.string().trim().default(""),
  profileImage: z.string().trim().default(""),
  lastLogin: z.date().nullable().default(null),

  // Email verification & invitation
  emailVerified: z.boolean().default(false),
  inviteToken: z.string().trim().optional(),
  inviteAcceptedAt: z.date().optional(),

  // Audit fields
  ...auditSchema.shape,
});
