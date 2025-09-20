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
 * Handle transactions data request with role-based access control
 */
const handleTransactionsData = async (queryParams, request) => {
  try {
    const currentUser = await getAuthenticatedUser();

    // Only admin and staff can access transactions
    if (!hasRole(currentUser, ["admin", "staff"])) {
      return forbidden("INSUFFICIENT_PERMISSIONS");
    }

    // Validate organization exists
    const organization = await validateOrganizationExists(currentUser);
    if (!organization || organization.error) return organization;

    const {
      page = 1,
      limit = 20,
      type,
      status,
      paymentMethod,
      processedBy,
      orderId,
      transactionNumber,
      startDate,
      endDate,
      search,
      sortBy = "processedAt",
      sortOrder = "desc",
    } = queryParams;

    // Build filter object
    const filter = { organizationId: organization._id };

    if (type) filter.type = type;
    if (status) filter.status = status;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (processedBy) filter.processedBy = processedBy;
    if (orderId) filter.orderId = orderId;
    if (transactionNumber) filter.transactionNumber = transactionNumber;

    // Date range filter
    if (startDate || endDate) {
      filter.processedAt = {};
      if (startDate) filter.processedAt.$gte = new Date(startDate);
      if (endDate) filter.processedAt.$lte = new Date(endDate);
    }

    // Search filter
    if (search) {
      filter.$or = [
        { transactionNumber: { $regex: search, $options: "i" } },
        { reference: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const [transactions, totalCount] = await Promise.all([
      Transaction.find(filter)
        .populate("processedBy", "name email")
        .populate("orderId", "orderNumber customerName")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Transaction.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    // Format transactions for response
    const formattedTransactions = formatTransactionsForResponse(transactions);

    return apiSuccess("TRANSACTIONS_RETRIEVED_SUCCESSFULLY", {
      transactions: formattedTransactions,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1,
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
