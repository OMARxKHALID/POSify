import { logCreate } from "@/lib/helpers/audit-helpers";
import {
  getAuthenticatedUser,
  hasRole,
  createMethodHandler,
  createPostHandler,
  apiSuccess,
  forbidden,
  badRequest,
  serverError,
  validateOrganizationExists,
  createTransactionWithValidation,
  formatTransactionForResponse,
  handleTransactionValidationError,
} from "@/lib/api";
import { transactionSchema } from "@/schemas/transaction-schema";
import { Transaction } from "@/models/transaction";

/**
 * Handle transaction creation with role-based access control
 */
const handleTransactionCreation = async (validatedData, request) => {
  try {
    const currentUser = await getAuthenticatedUser();

    if (!hasRole(currentUser, ["admin", "staff"])) {
      return forbidden("INSUFFICIENT_PERMISSIONS");
    }

    const organization = await validateOrganizationExists(currentUser);
    if (!organization || organization.error) return organization;

    // Create transaction with validation
    const transaction = await createTransactionWithValidation(
      organization._id,
      validatedData,
      currentUser._id
    );

    await logCreate("Transaction", transaction, currentUser, request);

    // Populate the transaction for response
    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate("processedBy", "name email")
      .populate("orderId", "orderNumber customerName")
      .lean();

    const formattedTransaction =
      formatTransactionForResponse(populatedTransaction);

    return apiSuccess(
      "TRANSACTION_CREATED_SUCCESSFULLY",
      {
        transaction: formattedTransaction,
        organization: { id: organization._id, name: organization.name },
        currentUser: {
          id: currentUser._id,
          role: currentUser.role,
          organizationId: currentUser.organizationId,
        },
      },
      201
    );
  } catch (error) {
    const errorInfo = handleTransactionValidationError(error);

    if (errorInfo.type === "validation") {
      return badRequest(errorInfo.message);
    }

    if (errorInfo.type === "duplicate") {
      return badRequest(errorInfo.message);
    }

    return serverError("TRANSACTION_CREATION_FAILED");
  }
};

/**
 * POST /api/dashboard/transactions/create
 * Create a new transaction (admin and staff only)
 */
export const POST = createPostHandler(
  transactionSchema,
  handleTransactionCreation
);
export const { GET, PUT, DELETE } = createMethodHandler(["POST"]);
