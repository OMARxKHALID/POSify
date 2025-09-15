import { Order } from "@/models/order";
import { logUpdate } from "@/lib/helpers/audit-helpers";
import {
  getAuthenticatedUser,
  hasRole,
  createMethodHandler,
  createPostHandler,
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
import { REFUND_STATUSES } from "@/constants";

const refundSchema = z.object({
  type: z.enum(["full", "partial"], {
    required_error: "Refund type is required",
  }),
  items: z
    .array(
      z.object({
        itemId: z.string().min(1, "Item ID is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        reason: z.string().optional(),
      })
    )
    .optional(),
  reason: z.string().min(1, "Refund reason is required"),
  amount: z.number().min(0).optional(),
});

/**
 * Handle refund processing with role-based access control
 */
const handleRefundProcessing = async (validatedData, request) => {
  try {
    const currentUser = await getAuthenticatedUser();

    // Only admin can process refunds
    if (!hasRole(currentUser, ["admin"])) {
      return forbidden("INSUFFICIENT_PERMISSIONS");
    }

    // Validate organization exists
    const organization = await validateOrganizationExists(currentUser);
    if (!organization || organization.error) return organization;

    const orderId = request.url.split("/").pop().replace("/refund", "");

    // Find the order
    const originalOrder = await Order.findOne({
      _id: orderId,
      organizationId: organization._id,
    });

    if (!originalOrder) {
      return notFound("ORDER_NOT_FOUND");
    }

    // Check if order is eligible for refund
    if (originalOrder.status === "cancelled") {
      return badRequest("ORDER_ALREADY_CANCELLED");
    }

    if (originalOrder.refundStatus === "refunded") {
      return badRequest("ORDER_ALREADY_REFUNDED");
    }

    // Calculate refund amount
    let refundAmount = 0;
    let refundItems = [];

    if (validatedData.type === "full") {
      refundAmount = originalOrder.total;
      refundItems = originalOrder.items.map((item) => ({
        itemId: item.menuItem,
        quantity: item.quantity,
        reason: validatedData.reason,
      }));
    } else {
      // Partial refund
      if (!validatedData.items || validatedData.items.length === 0) {
        return badRequest("REFUND_ITEMS_REQUIRED_FOR_PARTIAL_REFUND");
      }

      // Validate refund items
      for (const refundItem of validatedData.items) {
        const orderItem = originalOrder.items.find(
          (item) => item.menuItem.toString() === refundItem.itemId
        );

        if (!orderItem) {
          return badRequest("INVALID_REFUND_ITEM");
        }

        if (refundItem.quantity > orderItem.quantity) {
          return badRequest("REFUND_QUANTITY_EXCEEDS_ORDER_QUANTITY");
        }

        refundAmount += orderItem.price * refundItem.quantity;
        refundItems.push(refundItem);
      }
    }

    // Update order with refund information
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        refundStatus: "refunded",
        status:
          validatedData.type === "full" ? "refunded" : originalOrder.status,
        returns: [
          ...(originalOrder.returns || []),
          {
            type: validatedData.type,
            items: refundItems,
            amount: refundAmount,
            reason: validatedData.reason,
            processedBy: currentUser._id,
            processedAt: new Date(),
          },
        ],
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    // Log the update
    await logUpdate("Order", originalOrder, updatedOrder, currentUser, request);

    // Populate and format the updated order
    const populatedOrder = await populateOrder(orderId, organization._id);
    const formattedOrder = formatOrderForResponse(populatedOrder);

    return apiSuccess("REFUND_PROCESSED_SUCCESSFULLY", {
      order: formattedOrder,
      refund: {
        type: validatedData.type,
        amount: refundAmount,
        items: refundItems,
        reason: validatedData.reason,
        processedBy: currentUser._id,
        processedAt: new Date(),
      },
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

    return serverError("REFUND_PROCESSING_FAILED");
  }
};

/**
 * POST /api/dashboard/orders/[id]/refund
 * Process order refund
 */
export const POST = createPostHandler(handleRefundProcessing, refundSchema);
export const { GET, PUT, DELETE } = createMethodHandler(["POST"]);
