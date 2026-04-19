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
  createOrderWithValidation,
  populateOrder,
  formatOrderForResponse,
  handleOrderValidationError,
  createTransactionWithValidation,
} from "@/lib/api";
import { orderSchema } from "@/schemas/order-schema";
import { Order } from "@/models/order";

/**
 * Handle order creation with role-based access control and idempotency
 */
const handleOrderCreation = async (validatedData, request) => {
  try {
    const currentUser = await getAuthenticatedUser();

    if (!hasRole(currentUser, ["admin", "staff"])) {
      return forbidden("INSUFFICIENT_PERMISSIONS");
    }

    const organization = await validateOrganizationExists(currentUser);
    if (!organization || organization.error) return organization;

    const { idempotencyKey } = validatedData;

    // SECURE: Strict Idempotency Check
    if (idempotencyKey) {
      const existingOrder = await Order.findOne({
        idempotencyKey,
        organizationId: organization._id,
      }).lean();

      if (existingOrder) {
        const populatedOrder = await populateOrder(
          existingOrder._id,
          organization._id,
        );
        const formattedOrder = formatOrderForResponse(populatedOrder);

        return apiSuccess("ORDER_ALREADY_EXISTS_IDEMPOTENT", {
          order: formattedOrder,
          organization: { id: organization._id, name: organization.name },
          idempotent: true,
        });
      }
    }

    // Create order with internal validation logic
    const order = await createOrderWithValidation(
      organization._id,
      { ...validatedData },
      currentUser._id,
    );

    // Non-blocking Audit
    logCreate("Order", order, currentUser, request);

    // If the order is created as paid, create a corresponding transaction
    if (validatedData?.isPaid === true || validatedData?.status === "paid") {
      try {
        const transaction = await createTransactionWithValidation(
          organization._id,
          {
            orderId: order._id,
            type: "payment",
            amount: validatedData.total,
            paymentMethod: validatedData.paymentMethod,
            status: "completed",
            reference: `Order ${order.orderNumber} payment`,
          },
          currentUser._id,
        );

        logCreate("Transaction", transaction, currentUser, request);
      } catch (txError) {
        console.error("Secondary Transaction Failed:", txError);
        // Note: For absolute production consistency, this should be in a MongoDB transaction.
        // For now, we log the error but the order remains created.
      }
    }

    const populatedOrder = await populateOrder(order._id, organization._id);
    const formattedOrder = formatOrderForResponse(populatedOrder);

    return apiSuccess(
      "ORDER_CREATED_SUCCESSFULLY",
      {
        order: formattedOrder,
        organization: { id: organization._id, name: organization.name },
        currentUser: {
          id: currentUser._id,
          role: currentUser.role,
          organizationId: currentUser.organizationId,
        },
      },
      201,
    );
  } catch (error) {
    const errorInfo = handleOrderValidationError(error);

    if (errorInfo.type === "validation") {
      return badRequest(errorInfo.message);
    }

    if (errorInfo.type === "duplicate") {
      return badRequest(errorInfo.message);
    }

    console.error("Order Creation Logic Error:", error);
    return serverError("ORDER_CREATION_FAILED");
  }
};

/**
 * POST /api/dashboard/orders/create
 * Create a new order (admin and staff only)
 */
export const POST = createPostHandler(orderSchema, handleOrderCreation);
export const { GET, PUT, DELETE } = createMethodHandler(["POST"]);
