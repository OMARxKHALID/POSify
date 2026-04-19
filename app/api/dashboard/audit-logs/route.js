import mongoose from "mongoose";
import { z } from "zod";
import { AuditLog } from "@/models/audit_log";
import {
  getAuthenticatedUser,
  formatAuditLogData,
  hasRole,
  createMethodHandler,
  createGetHandler,
  apiSuccess,
  forbidden,
  serverError,
  badRequest,
} from "@/lib/api";

/**
 * Zod schema for audit log query validation
 */
const auditLogQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(200).default(20),
  resource: z.string().optional(),
  action: z.string().optional(),
  userRole: z.string().optional(),
  startDate: z.string().datetime().optional().or(z.string().length(10).optional()),
  endDate: z.string().datetime().optional().or(z.string().length(10).optional()),
  search: z.string().optional(),
});

/**
 * Handle audit logs data request with role-based access control
 */
const handleAuditLogsData = async (queryParams, request) => {
  try {
    const validatedParams = auditLogQuerySchema.safeParse(queryParams);
    if (!validatedParams.success) {
      return badRequest("INVALID_QUERY_PARAMS");
    }

    const {
      page,
      limit,
      resource,
      action,
      userRole,
      startDate,
      endDate,
      search,
    } = validatedParams.data;

    const currentUser = await getAuthenticatedUser();

    // Verify audit log access permissions
    if (!hasRole(currentUser, ["super_admin", "admin"])) {
      return forbidden("INSUFFICIENT_PERMISSIONS");
    }

    // Build filter object with strict ObjectId casting for organization scoping
    const filter = {};
    if (currentUser.role === "admin") {
      filter.organizationId = new mongoose.Types.ObjectId(currentUser.organizationId.toString());
    }

    if (resource && resource !== "all") filter.resource = resource;
    if (action && action !== "all") filter.action = action;
    if (userRole && userRole !== "all") filter.userRole = userRole;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: "i" } },
        { userEmail: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    // Use Aggregation for atomic results and count
    const [result] = await AuditLog.aggregate([
      { $match: filter },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ]);

    const totalCount = result.metadata[0]?.total || 0;
    const auditLogs = result.data;
    const formattedAuditLogs = auditLogs.map(formatAuditLogData);

    const totalPages = Math.ceil(totalCount / limit);

    return apiSuccess("AUDIT_LOGS_RETRIEVED_SUCCESSFULLY", {
      auditLogs: formattedAuditLogs,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit,
      },
      currentUser: {
        id: currentUser._id,
        role: currentUser.role,
        organizationId: currentUser.organizationId,
      },
    });
  } catch (error) {
    console.error("Audit Logs Error:", error);
    return serverError("FETCH_FAILED");
  }
};

/**
 * GET /api/dashboard/audit-logs
 * Get audit logs with filtering and pagination
 */
export const GET = createGetHandler(handleAuditLogsData);

// Fallback for unsupported HTTP methods
export const { POST, PUT, DELETE } = createMethodHandler(["GET"]);
