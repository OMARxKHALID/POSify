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
 * User registration schema (without organization)
 */
export const userRegisterSchemaWithoutOrganization = z.object({
  name: z.string().min(1, "Name is required").trim(),
  email: z.string().email("Invalid email format").toLowerCase().trim(),
  role: z.literal("pending"),
  status: z.literal("active"),
  emailVerified: z.literal(true),
  permissions: z.literal(["*"]),
  password: passwordSchema,
});

/**
 * Super admin registration schema (need no organization to register)
 */
export const superAdminRegisterSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  email: z.string().email("Invalid email format").toLowerCase().trim(),
  password: passwordSchema,
  role: z.literal("super_admin"),
  status: z.literal("active"),
  emailVerified: z.literal(true),
  permissions: z.literal(["*"]),
});
