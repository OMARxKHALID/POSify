/**
 * Audit Helpers
 * Simple functions for manual audit logging
 */

import { AuditLog } from "@/models/audit_log";

/**
 * Extract client IP address from request headers
 */
const getClientIP = (request) => {
  if (!request) return "unknown";

  // Try various headers in order of preference
  const headers = [
    "x-forwarded-for",
    "x-real-ip",
    "x-client-ip",
    "cf-connecting-ip", // Cloudflare
    "x-cluster-client-ip",
    "x-forwarded",
    "forwarded-for",
    "forwarded",
  ];

  for (const header of headers) {
    const value = request.headers.get(header);
    if (value) {
      // x-forwarded-for can contain multiple IPs, take the first one
      const ip = value.split(",")[0].trim();
      if (ip && ip !== "unknown") {
        return ip;
      }
    }
  }

  return "unknown";
};

/**
 * Main audit logging function
 * Logs user actions without breaking the main operation
 */
export const logAction = async (
  action,
  resource,
  resourceId,
  user,
  changes = null,
  request = null
) => {
  try {
    const auditLog = new AuditLog({
      action,
      resource,
      resourceId: resourceId.toString(),
      userId: user._id.toString(),
      userEmail: user.email,
      userRole: user.role,
      organizationId:
        user.role === "super_admin"
          ? undefined
          : user.organizationId?.toString(),
      changes,
      description: `${user.name} (${user.email}) performed ${action} on ${resource}`,
      ipAddress: getClientIP(request),
      userAgent: request?.headers.get("user-agent") || "unknown",
      metadata: {
        sessionId: user._id.toString(),
        requestId:
          request?.headers.get("x-request-id") ||
          `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      },
    });

    await auditLog.save();
    console.log(`✅ Audit logged: ${action} on ${resource} by ${user.email}`);
    return auditLog;
  } catch (error) {
    // Never break the main operation due to audit logging
    console.error("❌ Audit logging failed:", error.message);
    return null;
  }
};

/**
 * Helper to safely convert Mongoose objects to plain objects
 */
const toPlainObject = (item) => {
  return item?.toObject ? item.toObject() : item;
};

/**
 * Generic convenience functions for ANY model
 * These 3 functions can handle all your models with minimal code
 */
export const logCreate = async (
  modelName,
  newItem,
  createdBy,
  request = null
) => {
  return await logAction(
    `CREATE_${modelName.toUpperCase()}`,
    modelName,
    newItem._id,
    createdBy,
    { after: toPlainObject(newItem) },
    request
  );
};

export const logUpdate = async (
  modelName,
  oldItem,
  newItem,
  updatedBy,
  request = null
) => {
  return await logAction(
    `UPDATE_${modelName.toUpperCase()}`,
    modelName,
    newItem._id,
    updatedBy,
    { before: toPlainObject(oldItem), after: toPlainObject(newItem) },
    request
  );
};

export const logDelete = async (
  modelName,
  deletedItem,
  deletedBy,
  request = null
) => {
  return await logAction(
    `DELETE_${modelName.toUpperCase()}`,
    modelName,
    deletedItem._id,
    deletedBy,
    { before: toPlainObject(deletedItem) },
    request
  );
};
