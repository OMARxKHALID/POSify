/**
 * Transaction API utility functions
 * Centralized utilities for transaction-related API operations
 */

import { Transaction } from "@/models/transaction";
import { Order } from "@/models/order";

/**
 * Validate transaction data
 */
export const validateTransactionData = async (
  transactionData,
  organizationId
) => {
  // Validate order exists if orderId is provided
  if (transactionData.orderId) {
    const order = await Order.findOne({
      _id: transactionData.orderId,
      organizationId,
    }).lean();

    if (!order) {
      throw new Error("INVALID_ORDER_ID");
    }
  }

  // Validate amount is positive
  if (transactionData.amount <= 0) {
    throw new Error("INVALID_TRANSACTION_AMOUNT");
  }

  return true;
};

/**
 * Populate transaction with related data
 */
export const populateTransaction = async (transactionId, organizationId) => {
  return await Transaction.findOne({
    _id: transactionId,
    organizationId,
  })
    .populate("processedBy", "name email")
    .populate("orderId", "orderNumber customerName")
    .lean();
};

/**
 * Format transaction for API response
 */
export const formatTransactionForResponse = (transaction) => {
  if (!transaction) return null;

  return {
    id: transaction._id,
    transactionNumber: transaction.transactionNumber,
    receiptNumber: transaction.receiptNumber || null,
    type: transaction.type,
    amount: transaction.amount,
    signedAmount:
      transaction.type === "refund" ? -transaction.amount : transaction.amount,
    paymentMethod: transaction.paymentMethod,
    status: transaction.status,
    processedBy: transaction.processedBy
      ? {
          id: transaction.processedBy._id,
          name: transaction.processedBy.name,
          email: transaction.processedBy.email,
        }
      : null,
    processedAt: transaction.processedAt,
    reference: transaction.reference,
    orderId: transaction.orderId?._id || null,
    orderNumber: transaction.orderId?.orderNumber || null,
    customerName: transaction.orderId?.customerName || null,
    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt,
  };
};

/**
 * Format multiple transactions for API response
 */
export const formatTransactionsForResponse = (transactions) => {
  return transactions.map(formatTransactionForResponse);
};

/**
 * Handle transaction validation errors
 */
export const handleTransactionValidationError = (error) => {
  console.error("Transaction validation error:", error);

  if (error.name === "ValidationError") {
    const validationErrors = Object.values(error.errors).map(
      (err) => err.message
    );
    return {
      type: "validation",
      message: `VALIDATION_ERROR: ${validationErrors.join(", ")}`,
    };
  }

  if (error.code === 11000) {
    return {
      type: "duplicate",
      message: "TRANSACTION_NUMBER_EXISTS",
    };
  }

  if (error.message === "INVALID_ORDER_ID") {
    return {
      type: "validation",
      message: "INVALID_ORDER_ID: The specified order does not exist",
    };
  }

  if (error.message === "INVALID_TRANSACTION_AMOUNT") {
    return {
      type: "validation",
      message:
        "INVALID_TRANSACTION_AMOUNT: Transaction amount must be greater than 0",
    };
  }

  return {
    type: "server",
    message: `TRANSACTION_OPERATION_FAILED: ${
      error.message || "Unknown error"
    }`,
  };
};

/**
 * Create transaction with validation
 */
export const createTransactionWithValidation = async (
  organizationId,
  transactionData,
  currentUserId
) => {
  // Validate transaction data
  await validateTransactionData(transactionData, organizationId);

  // Create transaction with auto-generated transaction number
  const transaction = await Transaction.createWithTransactionNumber(
    organizationId,
    {
      ...transactionData,
      processedBy: currentUserId,
      processedAt: new Date(),
    }
  );

  return transaction;
};
