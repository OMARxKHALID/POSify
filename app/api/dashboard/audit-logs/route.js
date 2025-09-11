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
} from "@/lib/api";

/**
 * Build database filter object for audit logs query with role-based access
 */
const buildAuditLogFilter = (currentUser, queryParams) => {
  const { resource, action, userRole, startDate, endDate, search } =
    queryParams;
  const filter = {};

  // Apply organization-based filtering
  if (currentUser.role === "admin") {
    filter.organizationId = currentUser.organizationId;
  }

  // Apply resource type filter
  if (resource && resource !== "all") {
    filter.resource = resource;
  }

  // Apply action type filter
  if (action && action !== "all") {
    filter.action = action;
  }

  // Apply user role filter
  if (userRole && userRole !== "all") {
    filter.userRole = userRole;
  }

  // Apply date range filter
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) {
      filter.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      filter.createdAt.$lte = new Date(endDate);
    }
  }

  // Apply text search filter
  if (search) {
    filter.$or = [
      { description: { $regex: search, $options: "i" } },
      { userEmail: { $regex: search, $options: "i" } },
      { action: { $regex: search, $options: "i" } },
    ];
  }

  return filter;
};

/**
 * Handle audit logs data request with role-based access control
 */
const handleAuditLogsData = async (queryParams, request) => {
  const currentUser = await getAuthenticatedUser();

  // Verify audit log access permissions
  if (!hasRole(currentUser, ["super_admin", "admin"])) {
    return forbidden("INSUFFICIENT_PERMISSIONS");
  }

  // Extract pagination parameters
  const { page = 1, limit = 20 } = queryParams;

  // Build database filter object
  const filter = buildAuditLogFilter(currentUser, queryParams);

  // Calculate pagination values
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  try {
    // Get total record count
    const totalCount = await AuditLog.countDocuments(filter);

    // Get paginated audit logs
    const auditLogs = await AuditLog.find(filter)
      .sort({ createdAt: -1 }) // Sort by most recent first
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Clean audit log response data
    const formattedAuditLogs = auditLogs.map(formatAuditLogData);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    return apiSuccess("AUDIT_LOGS_RETRIEVED_SUCCESSFULLY", {
      auditLogs: formattedAuditLogs,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit: limitNum,
      },
      filters: {
        resource: queryParams.resource,
        action: queryParams.action,
        userRole: queryParams.userRole,
        startDate: queryParams.startDate,
        endDate: queryParams.endDate,
        search: queryParams.search,
      },
      currentUser: {
        id: currentUser._id,
        role: currentUser.role,
        organizationId: currentUser.organizationId,
      },
    });
  } catch (error) {
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
