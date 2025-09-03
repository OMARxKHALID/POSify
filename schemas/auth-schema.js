import { z } from "zod";
import { USER_ROLES } from "@/constants";

/**
 * Base password validation schema
 */
const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters");

/**
 * Password confirmation schem
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
});

/**
 * User registration schema (without organization)
 */
export const userRegisterSchema = z
  .object({
    name: z.string().min(1, "Name is required").trim(),
    email: z.string().email("Invalid email format").toLowerCase().trim(),
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
  role: z
    .enum(
      USER_ROLES.filter((role) => role !== "super_admin"),
      {
        errorMap: () => ({ message: "Role must be admin, staff or pending" }),
      }
    )
    .default("staff"), // Default to staff for new organization members
});

/**
 * Super admin registration schema
 */
export const superAdminRegisterSchema = z
  .object({
    name: z.string().min(1, "Name is required").trim(),
    email: z.string().email("Invalid email format").toLowerCase().trim(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.literal("super_admin"),
  })
  .merge(passwordConfirmationSchema);
