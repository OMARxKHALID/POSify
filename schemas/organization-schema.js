import { z } from "zod";
import {
  baseSchema,
  auditSchema,
  addressSchema,
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
  DEFAULT_ORGANIZATION_LIMITS,
  DEFAULT_ORGANIZATION_USAGE,
  DEFAULT_ORGANIZATION_SUBSCRIPTION,
} from "@/constants";

/**
 * Organization information schema
 */
export const organizationInfoSchema = z.object({
  legalName: z.string().trim().optional(),
  displayName: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  email: z
    .string()
    .email("Invalid email format")
    .toLowerCase()
    .trim()
    .optional(),
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
  plan: z
    .enum(SUBSCRIPTION_PLANS)
    .default(DEFAULT_ORGANIZATION_SUBSCRIPTION.plan),
  status: z
    .enum(SUBSCRIPTION_STATUSES)
    .default(DEFAULT_ORGANIZATION_SUBSCRIPTION.status),
  currentPeriodStart: z.date().optional(),
  currentPeriodEnd: z.date().optional(),
  trialEnd: z.date().optional(),
});

/**
 * Usage limits schema
 */
export const usageLimitsSchema = z.object({
  users: z.number().default(DEFAULT_ORGANIZATION_LIMITS.users),
  menuItems: z.number().default(DEFAULT_ORGANIZATION_LIMITS.menuItems),
  ordersPerMonth: z
    .number()
    .default(DEFAULT_ORGANIZATION_LIMITS.ordersPerMonth),
  locations: z.number().default(DEFAULT_ORGANIZATION_LIMITS.locations),
});

/**
 * Current usage schema
 */
export const currentUsageSchema = z.object({
  currentUsers: z.number().default(DEFAULT_ORGANIZATION_USAGE.currentUsers),
  currentMenuItems: z
    .number()
    .default(DEFAULT_ORGANIZATION_USAGE.currentMenuItems),
  ordersThisMonth: z
    .number()
    .default(DEFAULT_ORGANIZATION_USAGE.ordersThisMonth),
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
  limits: usageLimitsSchema.default({}),

  // Current usage tracking
  usage: currentUsageSchema.default({}),

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
  createdBy: true,
  lastModifiedBy: true,
});

/**
 * Organization query schema
 */
export const organizationQuerySchema = querySchema({
  status: z.enum(ORGANIZATION_STATUSES).optional(),
  businessType: z.enum(BUSINESS_TYPES).optional(),
}).omit({
  organizationId: true, // Organizations don't have organizationId
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
  usage: currentUsageSchema.partial(),
});

/**
 * Organization limits update schema
 */
export const organizationLimitsUpdateSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  limits: usageLimitsSchema.partial(),
});
