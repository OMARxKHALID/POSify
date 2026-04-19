import mongoose from "mongoose";
import { Transaction } from "@/models/transaction";
import {
  getAuthenticatedUser,
  hasRole,
  createMethodHandler,
  createGetHandler,
  apiSuccess,
  forbidden,
  notFound,
  badRequest,
  serverError,
  validateOrganizationExists,
  formatTransactionForResponse,
  handleTransactionValidationError,
} from "@/lib/api";

const handleGetTransactionById = async (_params, request) => {
  try {
    const currentUser = await getAuthenticatedUser();

    if (!hasRole(currentUser, ["admin", "staff"])) {
      return forbidden("INSUFFICIENT_PERMISSIONS");
    }

    const organization = await validateOrganizationExists(currentUser);
    if (!organization || organization.error) return organization;

    const { id } = _params;
    const { ObjectId } = mongoose.Types;

    // DEMO MODE BYPASS: Check for mock ID format (e.g., txn_001)
    if (id && id.startsWith("txn_")) {
      const { mockTransactions } = require("@/lib/mockup-data/transactions-mockup");
      const mockTxn = mockTransactions.find((txn) => txn._id === id);
      
      if (mockTxn) {
        return apiSuccess("TRANSACTIONS_RETRIEVED_SUCCESSFULLY", {
          transaction: formatTransactionForResponse(mockTxn),
          organization: { id: organization._id, name: organization.name },
          demo: true
        });
      }
    }

    if (!id || !ObjectId.isValid(id)) {
      return badRequest("INVALID_TRANSACTION_ID");
    }

    const transaction = await Transaction.findOne({
      _id: new ObjectId(id),
      organizationId: new ObjectId(organization._id.toString()),
    })
      .populate("processedBy", "name email")
      .populate("orderId", "orderNumber customerName")
      .lean();

    if (!transaction) {
      return notFound("TRANSACTION_NOT_FOUND");
    }

    const formatted = formatTransactionForResponse(transaction);

    return apiSuccess("TRANSACTIONS_RETRIEVED_SUCCESSFULLY", {
      transaction: formatted,
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

    return serverError("TRANSACTION_RETRIEVAL_FAILED");
  }
};

/**
 * GET /api/dashboard/transactions/[id]
 * Get a single transaction by ID
 */
export const GET = createGetHandler(handleGetTransactionById);
export const { POST, PUT, DELETE } = createMethodHandler(["GET"]);
