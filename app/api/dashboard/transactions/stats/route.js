import { Transaction } from "@/models/transaction";
import {
  getAuthenticatedUser,
  hasRole,
  createMethodHandler,
  createGetHandler,
  apiSuccess,
  forbidden,
  serverError,
  badRequest,
  validateOrganizationExists,
  handleTransactionValidationError,
} from "@/lib/api";

/**
 * Handle transaction stats request with role-based access control
 */
const handleTransactionStats = async (queryParams, request) => {
  try {
    const currentUser = await getAuthenticatedUser();

    // Only admin and staff can access transaction stats
    if (!hasRole(currentUser, ["admin", "staff"])) {
      return forbidden("INSUFFICIENT_PERMISSIONS");
    }

    // Validate organization exists
    const organization = await validateOrganizationExists(currentUser);
    if (!organization || organization.error) return organization;

    const { period = "today", startDate, endDate } = queryParams;

    // Build date filter
    let dateFilter = {};
    const now = new Date();

    if (period === "today") {
      const startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      const endOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1
      );
      dateFilter = {
        processedAt: {
          $gte: startOfDay,
          $lt: endOfDay,
        },
      };
    } else if (period === "week") {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      dateFilter = {
        processedAt: {
          $gte: startOfWeek,
        },
      };
    } else if (period === "month") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter = {
        processedAt: {
          $gte: startOfMonth,
        },
      };
    } else if (startDate || endDate) {
      dateFilter = {};
      if (startDate)
        dateFilter.processedAt = {
          ...dateFilter.processedAt,
          $gte: new Date(startDate),
        };
      if (endDate)
        dateFilter.processedAt = {
          ...dateFilter.processedAt,
          $lte: new Date(endDate),
        };
    }

    const filter = {
      organizationId: organization._id,
      status: "completed",
      ...dateFilter,
    };

    // Get transaction stats
    const [
      totalTransactions,
      totalAmount,
      paymentMethodStats,
      typeStats,
      staffStats,
    ] = await Promise.all([
      // Total transaction count
      Transaction.countDocuments(filter),

      // Total amount (sum of signed amounts)
      Transaction.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalAmount: {
              $sum: {
                $cond: [
                  { $eq: ["$type", "refund"] },
                  { $multiply: ["$amount", -1] },
                  "$amount",
                ],
              },
            },
          },
        },
      ]),

      // Payment method breakdown
      Transaction.aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$paymentMethod",
            count: { $sum: 1 },
            totalAmount: {
              $sum: {
                $cond: [
                  { $eq: ["$type", "refund"] },
                  { $multiply: ["$amount", -1] },
                  "$amount",
                ],
              },
            },
          },
        },
        { $sort: { count: -1 } },
      ]),

      // Transaction type breakdown
      Transaction.aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$type",
            count: { $sum: 1 },
            totalAmount: {
              $sum: {
                $cond: [
                  { $eq: ["$type", "refund"] },
                  { $multiply: ["$amount", -1] },
                  "$amount",
                ],
              },
            },
          },
        },
        { $sort: { count: -1 } },
      ]),

      // Staff performance
      Transaction.aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$processedBy",
            count: { $sum: 1 },
            totalAmount: {
              $sum: {
                $cond: [
                  { $eq: ["$type", "refund"] },
                  { $multiply: ["$amount", -1] },
                  "$amount",
                ],
              },
            },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    // Populate staff names
    const staffStatsWithNames = await Transaction.populate(staffStats, {
      path: "_id",
      select: "name email",
    });

    return apiSuccess("TRANSACTION_STATS_RETRIEVED_SUCCESSFULLY", {
      stats: {
        totalTransactions,
        totalAmount: totalAmount[0]?.totalAmount || 0,
        paymentMethodBreakdown: paymentMethodStats.map((stat) => ({
          method: stat._id,
          count: stat.count,
          totalAmount: stat.totalAmount,
        })),
        typeBreakdown: typeStats.map((stat) => ({
          type: stat._id,
          count: stat.count,
          totalAmount: stat.totalAmount,
        })),
        staffPerformance: staffStatsWithNames.map((stat) => ({
          staff: stat._id
            ? {
                id: stat._id._id,
                name: stat._id.name,
                email: stat._id.email,
              }
            : null,
          count: stat.count,
          totalAmount: stat.totalAmount,
        })),
        period,
        dateRange: {
          startDate: dateFilter.processedAt?.$gte || null,
          endDate: dateFilter.processedAt?.$lte || null,
        },
      },
      organization: { id: organization._id, name: organization.name },
      currentUser: {
        id: currentUser._id,
        role: currentUser.role,
        organizationId: currentUser.organizationId,
      },
    });
  } catch (error) {
    const errorInfo = handleTransactionValidationError(error);

    if (errorInfo.type === "validation") {
      return badRequest(errorInfo.message);
    }

    return serverError("TRANSACTION_STATS_RETRIEVAL_FAILED");
  }
};

/**
 * GET /api/dashboard/transactions/stats
 * Get transaction statistics based on authenticated user's role and permissions
 */
export const GET = createGetHandler(handleTransactionStats);
export const { POST, PUT, DELETE } = createMethodHandler(["GET"]);
