import mongoose from "mongoose";
import { z } from "zod";
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
  formatTransactionsForResponse,
  handleTransactionValidationError,
} from "@/lib/api";

/**
 * Zod schema for transactions query validation
 */
const transactionsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(200).default(20),
  type: z.string().optional(),
  status: z.string().optional(),
  paymentMethod: z.string().optional(),
  processedBy: z.string().optional(),
  orderId: z.string().optional(),
  transactionNumber: z.string().optional(),
  startDate: z.string().datetime().optional().or(z.string().length(10).optional()),
  endDate: z.string().datetime().optional().or(z.string().length(10).optional()),
  search: z.string().optional(),
  sortBy: z.string().default("processedAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

/**
 * Handle transactions data request with role-based access control
 */
const handleTransactionsData = async (queryParams, request) => {
  try {
    const validatedParams = transactionsQuerySchema.safeParse(queryParams);
    if (!validatedParams.success) {
      return badRequest("INVALID_QUERY_PARAMS");
    }

    const {
      page,
      limit,
      type,
      status,
      paymentMethod,
      processedBy,
      orderId,
      transactionNumber,
      startDate,
      endDate,
      search,
      sortBy,
      sortOrder,
    } = validatedParams.data;

    const currentUser = await getAuthenticatedUser();

    // Only admin and staff can access transactions
    if (!hasRole(currentUser, ["admin", "staff"])) {
      return forbidden("INSUFFICIENT_PERMISSIONS");
    }

    // Validate organization exists
    const organization = await validateOrganizationExists(currentUser);
    if (!organization || organization.error) return organization;

    // SECURE: Strict ObjectId casting for aggregation matching
    const { ObjectId } = mongoose.Types;
    const filter = { organizationId: new ObjectId(organization._id.toString()) };

    if (type) filter.type = type;
    if (status) filter.status = status;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    
    // Cast processedBy if present
    if (processedBy && ObjectId.isValid(processedBy)) {
        filter.processedBy = new ObjectId(processedBy);
    }
    
    // Cast orderId if present
    if (orderId && ObjectId.isValid(orderId)) {
        filter.orderId = new ObjectId(orderId);
    }
    
    if (transactionNumber) filter.transactionNumber = transactionNumber;

    if (startDate || endDate) {
      filter.processedAt = {};
      if (startDate) filter.processedAt.$gte = new Date(startDate);
      if (endDate) filter.processedAt.$lte = new Date(endDate);
    }

    if (search) {
      filter.$or = [
        { transactionNumber: { $regex: search, $options: "i" } },
        { reference: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    // Atomic Aggregation
    const [result] = await Transaction.aggregate([
      { $match: filter },
      { $sort: sort },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: "users",
                localField: "processedBy",
                foreignField: "_id",
                as: "processedByInfo",
              },
            },
            {
              $lookup: {
                from: "orders",
                localField: "orderId",
                foreignField: "_id",
                as: "orderInfo",
              },
            },
          ],
        },
      },
    ]);

    const totalCount = result.metadata[0]?.total || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Format results (Map looks up results for response compatibility)
    const transactions = result.data.map(t => ({
      ...t,
      processedBy: t.processedByInfo[0],
      orderId: t.orderInfo[0]
    }));

    const formattedTransactions = formatTransactionsForResponse(transactions);

    return apiSuccess("TRANSACTIONS_RETRIEVED_SUCCESSFULLY", {
      transactions: formattedTransactions,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
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

    return serverError("TRANSACTIONS_RETRIEVAL_FAILED");
  }
};

/**
 * GET /api/dashboard/transactions
 * Get transactions based on authenticated user's role and permissions
 */
export const GET = createGetHandler(handleTransactionsData);
export const { POST, PUT, DELETE } = createMethodHandler(["GET"]);
