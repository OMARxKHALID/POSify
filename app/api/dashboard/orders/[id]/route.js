import { Order } from "@/models/order";
import { logUpdate, logDelete } from "@/lib/helpers/audit-helpers";
import {
  getAuthenticatedUser,
  hasRole,
  createMethodHandler,
  createGetHandler,
  createPutHandler,
  createDeleteHandler,
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
import { orderSchema } from "@/schemas/order-schema";

/**
 * Handle single order data request with role-based access control
 */
const handleOrderData = async (queryParams, request) => {
  try {
    const currentUser = await getAuthenticatedUser();

    // Only admin and staff can access orders
    if (!hasRole(currentUser, ["admin", "staff"])) {
      return forbidden("INSUFFICIENT_PERMISSIONS");
    }

    // Validate organization exists
    const organization = await validateOrganizationExists(currentUser);
    if (!organization || organization.error) return organization;

    const orderId = request.url.split("/").pop();
    const order = await populateOrder(orderId, organization._id);

    if (!order) {
      return notFound("ORDER_NOT_FOUND");
    }

    const formattedOrder = formatOrderForResponse(order);

    return apiSuccess("ORDER_RETRIEVED_SUCCESSFULLY", {
      order: formattedOrder,
      organization: { id: organization._id, name: organization.name },
      currentUser: {
        id: currentUser._id,
        role: currentUser.role,
        organizationId: currentUser.organizationId,
      },
    });
  } catch (error) {
    return serverError("ORDER_RETRIEVAL_FAILED");
  }
};

/**
 * Handle order update with role-based access control
 */
const handleOrderUpdate = async (validatedData, request) => {
  try {
    const currentUser = await getAuthenticatedUser();

    // Only admin and staff can update orders
    if (!hasRole(currentUser, ["admin", "staff"])) {
      return forbidden("INSUFFICIENT_PERMISSIONS");
    }

    // Validate organization exists
    const organization = await validateOrganizationExists(currentUser);
    if (!organization || organization.error) return organization;

    const orderId = request.url.split("/").pop();

    // Find the order
    const originalOrder = await Order.findOne({
      _id: orderId,
      organizationId: organization._id,
    });

    if (!originalOrder) {
      return notFound("ORDER_NOT_FOUND");
    }

    // Update the order
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { ...validatedData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    // Log the update
    await logUpdate("Order", originalOrder, updatedOrder, currentUser, request);

    // Populate and format the updated order
    const populatedOrder = await populateOrder(orderId, organization._id);
    const formattedOrder = formatOrderForResponse(populatedOrder);

    return apiSuccess("ORDER_UPDATED_SUCCESSFULLY", {
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

    return serverError("ORDER_UPDATE_FAILED");
  }
};

/**
 * Handle order deletion with role-based access control
 */
const handleOrderDeletion = async (queryParams, request) => {
  try {
    const currentUser = await getAuthenticatedUser();

    // Only admin can delete orders
    if (!hasRole(currentUser, ["admin"])) {
      return forbidden("INSUFFICIENT_PERMISSIONS");
    }

    // Validate organization exists
    const organization = await validateOrganizationExists(currentUser);
    if (!organization || organization.error) return organization;

    const orderId = request.url.split("/").pop();

    // Find the order
    const order = await Order.findOne({
      _id: orderId,
      organizationId: organization._id,
    });

    if (!order) {
      return notFound("ORDER_NOT_FOUND");
    }

    // Delete the order
    await Order.findByIdAndDelete(orderId);

    // Log the deletion
    await logDelete("Order", order, currentUser, request);

    return apiSuccess("ORDER_DELETED_SUCCESSFULLY", {
      order: formatOrderForResponse(order),
      organization: { id: organization._id, name: organization.name },
      currentUser: {
        id: currentUser._id,
        role: currentUser.role,
        organizationId: currentUser.organizationId,
      },
    });
  } catch (error) {
    return serverError("ORDER_DELETION_FAILED");
  }
};

/**
 * GET /api/dashboard/orders/[id]
 * Get a single order by ID
 */
export const GET = createGetHandler(handleOrderData);

/**
 * PUT /api/dashboard/orders/[id]
 * Update an order
 */
export const PUT = createPutHandler(handleOrderUpdate, orderSchema);

/**
 * DELETE /api/dashboard/orders/[id]
 * Delete an order
 */
export const DELETE = createDeleteHandler(handleOrderDeletion);
