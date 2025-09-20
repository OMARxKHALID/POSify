import { Order } from "@/models/order";
import { Transaction } from "@/models/transaction";
import { logUpdate, logCreate } from "@/lib/helpers/audit-helpers";
import {
  getAuthenticatedUser,
  hasRole,
  createMethodHandler,
  createPutHandler,
  apiSuccess,
  forbidden,
  badRequest,
  notFound,
  serverError,
  validateOrganizationExists,
  populateOrder,
  formatOrderForResponse,
  handleOrderValidationError,
} from "@/lib/api";
import { z } from "zod";
import { ORDER_STATUSES } from "@/constants";

const statusUpdateSchema = z.object({
  status: z.enum(ORDER_STATUSES, { required_error: "Status is required" }),
  notes: z.string().optional(),
});

/**
 * Handle order status update with role-based access control
 */
const handleStatusUpdate = async (validatedData, request) => {
  try {
    const currentUser = await getAuthenticatedUser();

    // Only admin and staff can update order status
    if (!hasRole(currentUser, ["admin", "staff"])) {
      return forbidden("INSUFFICIENT_PERMISSIONS");
    }

    // Validate organization exists
    const organization = await validateOrganizationExists(currentUser);
    if (!organization || organization.error) return organization;

    const orderId = request.url.split("/").pop().replace("/status", "");

    // Find the order
    const originalOrder = await Order.findOne({
      _id: orderId,
      organizationId: organization._id,
    });

    if (!originalOrder) {
      return notFound("ORDER_NOT_FOUND");
    }

    // Validate status transition
    const currentStatus = originalOrder.status;
    const newStatus = validatedData.status;

    // Define valid status transitions aligned with ORDER_STATUSES
    const validTransitions = {
      pending: ["preparing", "cancelled"],
      preparing: ["ready", "cancelled"],
      ready: ["served", "cancelled"],
      served: ["paid", "cancelled"],
      paid: [],
      cancelled: [],
      refund: [],
      "partial refund": [],
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      return badRequest("INVALID_STATUS_TRANSITION");
    }

    // Update the order status (mark paid when status becomes paid)
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        status: newStatus,
        updatedAt: new Date(),
        ...(newStatus === "paid" ? { isPaid: true } : {}),
      },
      { new: true, runValidators: true }
    );

    // Create transaction when order is marked as paid
    if (newStatus === "paid" && currentStatus !== "paid") {
      const transaction = await Transaction.createWithTransactionNumber(
        organization._id,
        {
          orderId: orderId,
          type: "payment",
          amount: originalOrder.total,
          paymentMethod: originalOrder.paymentMethod,
          status: "completed",
          processedBy: currentUser._id,
          processedAt: new Date(),
          reference: `Payment for order ${originalOrder.orderNumber}`,
        }
      );

      await logCreate("Transaction", transaction, currentUser, request);
    }

    // Log the update
    await logUpdate("Order", originalOrder, updatedOrder, currentUser, request);

    // Populate and format the updated order
    const populatedOrder = await populateOrder(orderId, organization._id);
    const formattedOrder = formatOrderForResponse(populatedOrder);

    return apiSuccess("ORDER_STATUS_UPDATED_SUCCESSFULLY", {
      order: formattedOrder,
      organization: { id: organization._id, name: organization.name },
      currentUser: {
        id: currentUser._id,
        role: currentUser.role,
        organizationId: currentUser.organizationId,
      },
    });
  } catch (error) {
    const errorInfo = handleOrderValidationError(error);

    if (errorInfo.type === "validation") {
      return badRequest(errorInfo.message);
    }

    return serverError("ORDER_STATUS_UPDATE_FAILED");
  }
};

/**
 * PUT /api/dashboard/orders/[id]/status
 * Update order status
 */
export const PUT = createPutHandler(statusUpdateSchema, handleStatusUpdate);
export const { GET, POST, DELETE } = createMethodHandler(["PUT"]);
