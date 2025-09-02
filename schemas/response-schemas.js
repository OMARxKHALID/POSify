import { z } from "zod";

/**
 * Generic success response schema
 */
export const successResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.any().optional(),
});

/**
 * Generic error response schema
 */
export const errorResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  errors: z.record(z.array(z.string())).optional(),
  code: z.string().optional(),
});

/**
 * Generic delete response schema
 */
export const deleteResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  deletedCount: z.number().optional(),
});

/**
 * Generic update response schema
 */
export const updateResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.any().optional(),
  changes: z.record(z.any()).optional(),
});

/**
 * Generic create response schema
 */
export const createResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.any().optional(),
  id: z.string().optional(),
});

/**
 * Generic validation error schema
 */
export const validationErrorSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  errors: z.record(z.array(z.string())),
  field: z.string().optional(),
});

/**
 * Generic file upload response schema
 */
export const fileUploadResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  file: z
    .object({
      id: z.string(),
      name: z.string(),
      url: z.string(),
      size: z.number(),
      type: z.string(),
    })
    .optional(),
});

/**
 * Generic search response schema
 */
export const searchResponseSchema = (schema) =>
  z.object({
    data: z.array(schema),
    total: z.number(),
    query: z.string(),
    filters: z.record(z.any()).optional(),
  });

/**
 * Generic statistics response schema
 */
export const statisticsResponseSchema = z.object({
  success: z.boolean(),
  data: z.record(z.any()),
  period: z.string().optional(),
  lastUpdated: z.date().optional(),
});

/**
 * Generic export response schema
 */
export const exportResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  downloadUrl: z.string().optional(),
  filename: z.string().optional(),
  format: z.string().optional(),
  recordCount: z.number().optional(),
});
