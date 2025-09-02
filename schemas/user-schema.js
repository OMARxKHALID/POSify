import { z } from "zod";
import {
  baseSchema,
  auditSchema,
  createSchema,
  updateSchema,
  querySchema,
  paginatedResponseSchema,
  singleItemResponseSchema,
} from "./base-schema.js";
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
    errorMap: () => ({ message: "Role must be super_admin, admin or staff" }),
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
  status: z.enum(USER_STATUSES).default("invited"),
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

/**
 * Create user schema (for registration/invitation)
 */
export const createUserSchema = createSchema(userSchema).omit({
  permissionsUpdatedAt: true,
  lastLogin: true,
  inviteAcceptedAt: true,
  createdBy: true,
  lastModifiedBy: true,
});

/**
 * Update user schema
 */
export const updateUserSchema = updateSchema(userSchema).omit({
  password: true, // Password updates handled separately
  email: true, // Email updates handled separately
  permissionsUpdatedAt: true,
  inviteToken: true,
  inviteAcceptedAt: true,
});

/**
 * User login schema
 */
export const userLoginSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});

/**
 * Change password schema
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

/**
 * Reset password schema
 */
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

/**
 * User query schema
 */
export const userQuerySchema = querySchema({
  role: z.enum(USER_ROLES).optional(),
  status: z.enum(USER_STATUSES).optional(),
  organizationId: z.string().optional(), // Allow filtering by organization
});

/**
 * User response schema (without sensitive data)
 */
export const userResponseSchema = userSchema.omit({
  password: true,
  inviteToken: true,
});

/**
 * User list response schema
 */
export const userListResponseSchema =
  paginatedResponseSchema(userResponseSchema);

/**
 * User single response schema
 */
export const userSingleResponseSchema =
  singleItemResponseSchema(userResponseSchema);
