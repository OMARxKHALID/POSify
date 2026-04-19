import { z } from "zod";
import { baseSchema, auditSchema, addressSchema } from "./base-schema";
import {
  BUSINESS_TYPES,
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_STATUSES,
  ORGANIZATION_STATUSES,
  CURRENCIES,
  TIMEZONES,
  LANGUAGES,
} from "@/constants";


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
  currentPeriodStart: z.date().optional(),
  currentPeriodEnd: z.date().optional(),
  trialEnd: z.date().optional(),
});


export const limitsSchema = z.object({
  users: z.number().default(2),
  menuItems: z.number().default(50),
  ordersPerMonth: z.number().default(100),
  locations: z.number().default(1),
});


export const usageSchema = z.object({
  currentUsers: z.number().default(0),
  currentMenuItems: z.number().default(0),
  ordersThisMonth: z.number().default(0),
  lastResetDate: z.date().default(() => new Date()),
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
