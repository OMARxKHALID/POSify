import { Order } from "@/models/order";
import { logUpdate } from "@/lib/helpers/audit-helpers";
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
  status: z.enum(
    ORDER_STATUSES.map((s) => s.value),
    {
      required_error: "Status is required",
    }
  ),
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

    // Define valid status transitions
    const validTransitions = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["preparing", "cancelled"],
      preparing: ["ready", "cancelled"],
      ready: ["completed", "cancelled"],
      completed: [], // No transitions from completed
      cancelled: [], // No transitions from cancelled
      refunded: [], // No transitions from refunded
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      return badRequest("INVALID_STATUS_TRANSITION");
    }

    // Update the order status
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        status: newStatus,
        notes: validatedData.notes || originalOrder.notes,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

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
export const PUT = createPutHandler(handleStatusUpdate, statusUpdateSchema);
export const { GET, POST, DELETE } = createMethodHandler(["PUT"]);
