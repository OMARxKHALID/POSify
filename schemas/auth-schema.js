import { z } from "zod";

/**
 * Base password validation schema
 */
const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters");

/**
 * Password confirmation schema
 */
const passwordConfirmationSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

/**
 * Login schema
 */
export const loginSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
});

/**
 * User registration schema (without organization)
 */
export const userRegisterSchema = z
  .object({
    name: z.string().min(1, "Name is required").trim(),
    email: z.string().email("Invalid email format").toLowerCase().trim(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .merge(passwordConfirmationSchema);

/**
 * Admin user registration schema (for existing organizations)
 */
export const adminRegisterSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  email: z.string().email("Invalid email format").toLowerCase().trim(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  organizationId: z.string().min(1, "Organization ID is required"),
  role: z.enum(["admin", "staff"]).default("admin"),
});

/**
 * Super admin registration schema
 */
export const superAdminRegisterSchema = z
  .object({
    name: z.string().min(1, "Name is required").trim(),
    email: z.string().email("Invalid email format").toLowerCase().trim(),
  })
  .merge(passwordConfirmationSchema);
