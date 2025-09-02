import { z } from "zod";
import {
  baseSchema,
  addressSchema,
  auditSchema,
  createSchema,
  updateSchema,
  querySchema,
  paginatedResponseSchema,
  singleItemResponseSchema,
} from "./base-schema.js";
import {
  BUSINESS_TYPES,
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_STATUSES,
  ORGANIZATION_STATUSES,
  CURRENCIES,
  TIMEZONES,
  LANGUAGES,
} from "@/constants";

/**
 * Organization information schema
 */
export const organizationInfoSchema = z.object({
  legalName: z.string().trim().optional(),
  displayName: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  email: z.string().email().toLowerCase().trim().optional(),
  website: z.string().trim().optional(),
  address: addressSchema.optional(),
  logoUrl: z.string().trim().optional(),
  taxId: z.string().trim().optional(),
  currency: z.enum(CURRENCIES).default("USD"),
  timezone: z.enum(TIMEZONES).default("UTC"),
  language: z.enum(LANGUAGES).default("en"),
});

/**
 * Subscription schema
 */
export const subscriptionSchema = z.object({
  plan: z.enum(SUBSCRIPTION_PLANS).default("free"),
  status: z.enum(SUBSCRIPTION_STATUSES).default("trialing"),
  currentPeriodStart: z.date().optional(),
  currentPeriodEnd: z.date().optional(),
  trialEnd: z.date().optional(),
});

/**
 * Limits schema
 */
export const limitsSchema = z.object({
  users: z.number().default(2),
  menuItems: z.number().default(50),
  ordersPerMonth: z.number().default(100),
  locations: z.number().default(1),
});

/**
 * Usage schema
 */
export const usageSchema = z.object({
  currentUsers: z.number().default(0),
  currentMenuItems: z.number().default(0),
  ordersThisMonth: z.number().default(0),
  lastResetDate: z.date().default(() => new Date()),
});

/**
 * Organization schema
 * Aligns with the Mongoose Organization model
 */
export const organizationSchema = baseSchema.extend({
  // Required fields
  name: z.string().min(1, "Organization name is required").trim(),

  // Optional fields
  slug: z.string().trim().toLowerCase().optional(),
  domain: z.string().trim().toLowerCase().optional(),
  status: z.enum(ORGANIZATION_STATUSES).default("active"),
  registeredAt: z.date().default(() => new Date()),
  businessType: z.enum(BUSINESS_TYPES).default("restaurant"),

  // Business/store information
  information: organizationInfoSchema.default({}),

  // Subscription management
  subscription: subscriptionSchema.default({}),

  // Usage limits
  limits: limitsSchema.default({}),

  // Current usage tracking
  usage: usageSchema.default({}),

  onboardingCompleted: z.boolean().default(false),

  // Audit fields
  ...auditSchema.shape,
});

/**
 * Create organization schema
 */
export const createOrganizationSchema = createSchema(organizationSchema).omit({
  slug: true,
  registeredAt: true,
  usage: true,
  onboardingCompleted: true,
  createdBy: true,
  lastModifiedBy: true,
});

/**
 * Update organization schema
 */
export const updateOrganizationSchema = updateSchema(organizationSchema).omit({
  slug: true,
  registeredAt: true,
  usage: true,
});

/**
 * Organization query schema
 */
export const organizationQuerySchema = querySchema({
  businessType: z.enum(BUSINESS_TYPES).optional(),
  status: z.enum(ORGANIZATION_STATUSES).optional(),
  subscriptionPlan: z.enum(SUBSCRIPTION_PLANS).optional(),
});

/**
 * Organization response schema
 */
export const organizationResponseSchema = organizationSchema;

/**
 * Organization list response schema
 */
export const organizationListResponseSchema = paginatedResponseSchema(
  organizationResponseSchema
);

/**
 * Organization single response schema
 */
export const organizationSingleResponseSchema = singleItemResponseSchema(
  organizationResponseSchema
);

/**
 * Organization statistics schema
 */
export const organizationStatsSchema = z.object({
  totalOrganizations: z.number(),
  activeOrganizations: z.number(),
  trialOrganizations: z.number(),
  paidOrganizations: z.number(),
  totalUsers: z.number(),
  totalOrders: z.number(),
  totalRevenue: z.number(),
});

/**
 * Organization usage update schema
 */
export const organizationUsageUpdateSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  usage: usageSchema.partial(),
});

/**
 * Organization limits update schema
 */
export const organizationLimitsUpdateSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  limits: limitsSchema.partial(),
});
