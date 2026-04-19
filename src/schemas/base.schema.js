import { z } from "zod";


export const baseSchema = z.object({
  _id: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});


export const organizationBaseSchema = baseSchema.extend({
  organizationId: z.string().min(1, "Organization ID is required"),
});


export const auditSchema = z.object({
  createdBy: z.string().optional(),
  lastModifiedBy: z.string().optional(),
});


export const addressSchema = z.object({
  street: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  postalCode: z.string().trim().optional(),
  country: z.string().trim().optional(),
});


export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});


export const createSchema = (baseSchema) =>
  baseSchema.omit({
    _id: true,
    createdAt: true,
    updatedAt: true,
  });


export const updateSchema = (baseSchema) =>
  baseSchema.partial().omit({
    _id: true,
    organizationId: true,
    createdAt: true,
    updatedAt: true,
  });

