import { z } from "zod";

/**
 * Base password validation schema
 */
const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters");

/**
 * Login schema
 */
export const loginSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});

/**
 * User registration schema
 */
export const userRegistrationSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  email: z.string().email("Invalid email format").toLowerCase().trim(),
  password: passwordSchema,
});

/**
 * User creation schema (for admin creating staff)
 */
export const userCreationSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  email: z.string().email("Invalid email format").toLowerCase().trim(),
  password: passwordSchema,
  role: z.enum(["staff"]).default("staff"),
  permissions: z.array(z.string()).optional(),
});

/**
 * User edit schema
 */
export const userEditSchema = z.object({
  name: z.string().min(1, "Name is required").trim().optional(),
  email: z
    .string()
    .email("Invalid email format")
    .toLowerCase()
    .trim()
    .optional(),
  password: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (val) => !val || val.trim() === "" || val.length >= 6,
      "Password must be at least 6 characters"
    ),
  role: z.enum(["admin", "staff"]).optional(),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
  permissions: z.array(z.string()).optional(),
});

/**
 * Organization ownership transfer schema
 */
export const organizationTransferSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  newOwnerId: z.string().min(1, "New owner ID is required"),
});
