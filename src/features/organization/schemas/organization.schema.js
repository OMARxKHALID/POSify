import { z } from "zod";
import { baseSchema, auditSchema, addressSchema } from "@/schemas/base.schema";
import { CURRENCIES, LANGUAGES, TIMEZONES } from "@/constants";
import { SUBSCRIPTION_STATUSES } from "@/features/settings/constants/business.constants";
import { ORGANIZATION_STATUSES } from "@/features/settings/constants/business.constants";
import { BUSINESS_TYPES, SUBSCRIPTION_PLANS } from "@/features/settings/constants/business.constants";

export const limitsSchema = z.object({
  maxUsers: z.number().default(10),
  maxMenuItems: z.number().default(100),
  maxOrdersPerDay: z.number().default(500),
});

export const usageSchema = z.object({
  usersCount: z.number().default(1),
  menuItemsCount: z.number().default(0),
  ordersCount: z.number().default(0),
});

export const organizationInfoSchema = z.object({
  legalName: z.string().trim().optional(),
  displayName: z.string().trim().optional(),
  orgPhone: z.string().trim().optional(),
  orgEmail: z.string().email().toLowerCase().trim().optional(),
  website: z.string().trim().optional(),
  address: addressSchema.optional(),
  logoUrl: z.string().trim().optional(),
  taxId: z.string().trim().optional(),
  currency: z.enum(CURRENCIES).default("USD"),
  timezone: z.enum(TIMEZONES).default("UTC"),
  language: z.enum(LANGUAGES).default("en"),
});

export const subscriptionSchema = z.object({
  plan: z.enum(SUBSCRIPTION_PLANS).default("free"),
  status: z.enum(SUBSCRIPTION_STATUSES).default("trialing"),
  currentPeriodStart: z.coerce.date().optional(),
  currentPeriodEnd: z.coerce.date().optional(),
  trialEnd: z.coerce.date().optional(),
  lastResetDate: z.coerce.date().optional(),
});

export const organizationSchema = baseSchema.extend({
  name: z.string().min(1, "Organization name is required").trim(),
  slug: z.string().trim().toLowerCase().optional(),
  domain: z.string().trim().toLowerCase().optional(),
  status: z.enum(ORGANIZATION_STATUSES).default("active"),
  businessType: z.enum(BUSINESS_TYPES).default("restaurant"),
  information: organizationInfoSchema.default({}),
  owner: z.string().min(1, "Owner ID is required"),
  subscription: subscriptionSchema.default({}),
  limits: limitsSchema.default({}),
  usage: usageSchema.default({}),
  onboardingCompleted: z.boolean().default(false),
  ...auditSchema.shape,
});

export const organizationRegisterSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  organizationName: z.string().min(1, "Organization name is required").trim(),
  businessType: z.enum(BUSINESS_TYPES).optional(),
  information: organizationInfoSchema.optional(),
});
