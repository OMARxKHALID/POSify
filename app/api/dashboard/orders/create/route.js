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

/**
 * Handle order creation with role-based access control
 */
const handleOrderCreation = async (validatedData, request) => {
  try {
    const currentUser = await getAuthenticatedUser();

    if (!hasRole(currentUser, ["admin", "staff"])) {
      return forbidden("INSUFFICIENT_PERMISSIONS");
    }

    const organization = await validateOrganizationExists(currentUser);
    if (!organization || organization.error) return organization;

    const order = await createOrderWithValidation(
      organization._id,
      validatedData,
      currentUser._id
    );

    await logCreate("Order", order, currentUser, request);

    // If the order is created as paid, create a corresponding transaction
    if (validatedData?.isPaid === true || validatedData?.status === "paid") {
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
        currentUser._id
      );

      await logCreate("Transaction", transaction, currentUser, request);
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
      201
    );
  } catch (error) {
    const errorInfo = handleOrderValidationError(error);

    if (errorInfo.type === "validation") {
      return badRequest(errorInfo.message);
    }

    if (errorInfo.type === "duplicate") {
      return badRequest(errorInfo.message);
    }

    return serverError("ORDER_CREATION_FAILED");
  }
};

/**
 * POST /api/dashboard/orders/create
 * Create a new order (admin and staff only)
 */
export const POST = createPostHandler(orderSchema, handleOrderCreation);
export const { GET, PUT, DELETE } = createMethodHandler(["POST"]);
