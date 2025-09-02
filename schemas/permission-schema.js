import { z } from "zod";
import {
  organizationBaseSchema,
  createSchema,
  updateSchema,
  querySchema,
  paginatedResponseSchema,
  singleItemResponseSchema,
} from "./base-schema.js";
import {
  SUPER_ADMIN_PERMISSIONS,
  ADMIN_PERMISSIONS,
  STAFF_PERMISSIONS,
  USER_ROLES,
} from "@/constants";

/**
 * Permission schema
 * Represents individual permissions that can be assigned to users
 */
export const permissionSchema = z.object({
  name: z.string().min(1, "Permission name is required").trim(),
  description: z.string().trim().optional(),
  category: z.string().trim().optional(),
  resource: z.string().trim().optional(),
  action: z.string().trim().optional(),
  isActive: z.boolean().default(true),
});

/**
 * Role permission mapping schema
 * Maps roles to their default permissions
 */
export const rolePermissionMappingSchema = z.object({
  role: z.enum(USER_ROLES),
  permissions: z.array(z.string()),
  isDefault: z.boolean().default(true),
});

/**
 * User permission schema
 * Represents permissions assigned to a specific user
 */
export const userPermissionSchema = organizationBaseSchema.extend({
  userId: z.string().min(1, "User ID is required"),
  permissions: z.array(z.string()).default([]),
  permissionsUpdatedAt: z.date().default(() => new Date()),
  updatedBy: z.string().optional(),
});

/**
 * Create user permission schema
 */
export const createUserPermissionSchema = createSchema(userPermissionSchema).omit({
  permissionsUpdatedAt: true,
  updatedBy: true,
});

/**
 * Update user permission schema
 */
export const updateUserPermissionSchema = updateSchema(userPermissionSchema).omit({
  userId: true,
  organizationId: true,
});

/**
 * User permission query schema
 */
export const userPermissionQuerySchema = querySchema({
  userId: z.string().optional(),
  role: z.enum(USER_ROLES).optional(),
});

/**
 * User permission response schema
 */
export const userPermissionResponseSchema = userPermissionSchema;

/**
 * User permission list response schema
 */
export const userPermissionListResponseSchema = paginatedResponseSchema(
  userPermissionResponseSchema
);

/**
 * User permission single response schema
 */
export const userPermissionSingleResponseSchema = singleItemResponseSchema(
  userPermissionResponseSchema
);

/**
 * Permission assignment schema
 * For assigning permissions to users
 */
export const permissionAssignmentSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  userId: z.string().min(1, "User ID is required"),
  permissions: z.array(z.string()),
  replaceExisting: z.boolean().default(false),
});

/**
 * Permission removal schema
 * For removing permissions from users
 */
export const permissionRemovalSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  userId: z.string().min(1, "User ID is required"),
  permissions: z.array(z.string()),
});

/**
 * Bulk permission operation schema
 * For bulk permission operations
 */
export const bulkPermissionOperationSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  operation: z.enum(["assign", "remove", "replace"]),
  users: z.array(
    z.object({
      userId: z.string().min(1, "User ID is required"),
      permissions: z.array(z.string()),
    })
  ),
});

/**
 * Permission check schema
 * For checking if a user has specific permissions
 */
export const permissionCheckSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  userId: z.string().min(1, "User ID is required"),
  permissions: z.array(z.string()),
  requireAll: z.boolean().default(false),
});

/**
 * Permission check response schema
 */
export const permissionCheckResponseSchema = z.object({
  hasPermission: z.boolean(),
  missingPermissions: z.array(z.string()),
  userPermissions: z.array(z.string()),
});

/**
 * Permission statistics schema
 */
export const permissionStatsSchema = z.object({
  totalPermissions: z.number(),
  permissionsByRole: z.record(z.number()),
  permissionsByCategory: z.record(z.number()),
  mostAssignedPermissions: z.array(
    z.object({
      permission: z.string(),
      count: z.number(),
    })
  ),
});

/**
 * Role permission template schema
 * For creating role-based permission templates
 */
export const rolePermissionTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required").trim(),
  description: z.string().trim().optional(),
  role: z.enum(USER_ROLES),
  permissions: z.array(z.string()),
  isDefault: z.boolean().default(false),
  organizationId: z.string().optional(), // For custom templates
});

/**
 * Create role permission template schema
 */
export const createRolePermissionTemplateSchema = createSchema(
  rolePermissionTemplateSchema
).omit({
  isDefault: true,
});

/**
 * Update role permission template schema
 */
export const updateRolePermissionTemplateSchema = updateSchema(
  rolePermissionTemplateSchema
).omit({
  role: true,
  isDefault: true,
});

/**
 * Permission import schema
 * For importing permissions from external sources
 */
export const permissionImportSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  permissions: z.array(
    z.object({
      name: z.string().min(1, "Permission name is required"),
      description: z.string().trim().optional(),
      category: z.string().trim().optional(),
      resource: z.string().trim().optional(),
      action: z.string().trim().optional(),
    })
  ),
  overwrite: z.boolean().default(false),
});

/**
 * Permission export schema
 * For exporting permissions
 */
export const permissionExportSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  format: z.enum(["json", "csv"]).default("json"),
  includeInactive: z.boolean().default(false),
  categories: z.array(z.string()).optional(),
});

/**
 * Permission cleanup schema
 * For cleaning up unused permissions
 */
export const permissionCleanupSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  dryRun: z.boolean().default(true),
  removeUnused: z.boolean().default(false),
  minUsageThreshold: z.number().min(0).default(0),
});

/**
 * Permission cleanup response schema
 */
export const permissionCleanupResponseSchema = z.object({
  totalPermissions: z.number(),
  unusedPermissions: z.array(z.string()),
  permissionsToRemove: z.array(z.string()),
  estimatedSavings: z.number(),
});
