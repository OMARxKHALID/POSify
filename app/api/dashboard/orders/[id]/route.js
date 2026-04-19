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
const handleOrderData = async (unifiedParams, request) => {
  try {
    const currentUser = await getAuthenticatedUser();

    // Only admin and staff can access orders
    if (!hasRole(currentUser, ["admin", "staff"])) {
      return forbidden("INSUFFICIENT_PERMISSIONS");
    }

    // Validate organization exists
    const organization = await validateOrganizationExists(currentUser);
    if (!organization || organization.error) return organization;

    const { id: orderId } = unifiedParams;
    const { ObjectId } = mongoose.Types;

    // DEMO MODE BYPASS: Check for mock ID format (e.g., ord_001)
    if (orderId && orderId.startsWith("ord_")) {
      const { mockOrders } = require("@/lib/mockup-data/orders-mockup");
      const mockOrder = mockOrders.find((ord) => ord._id === orderId || ord.id === orderId);
      
      if (mockOrder) {
        return apiSuccess("ORDER_RETRIEVED_SUCCESSFULLY", {
          order: formatOrderForResponse(mockOrder),
          organization: { id: organization._id, name: organization.name },
          demo: true
        });
      }
    }

    if (!orderId || !ObjectId.isValid(orderId)) {
        return notFound("ORDER_NOT_FOUND");
    }

    const order = await populateOrder(new ObjectId(orderId), new ObjectId(organization._id.toString()));

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
const handleOrderUpdate = async (validatedData, request, params) => {
  try {
    const currentUser = await getAuthenticatedUser();

    // Only admin and staff can update orders
    if (!hasRole(currentUser, ["admin", "staff"])) {
      return forbidden("INSUFFICIENT_PERMISSIONS");
    }

    // Validate organization exists
    const organization = await validateOrganizationExists(currentUser);
    if (!organization || organization.error) return organization;

    const { id: orderId } = params;

    // SECURE & ATOMIC: Find and update in one operation restricted by tenant
    const originalOrder = await Order.findOne({
      _id: orderId,
      organizationId: organization._id,
    }).lean();

    if (!originalOrder) {
      return notFound("ORDER_NOT_FOUND");
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { ...validatedData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    // Non-blocking Audit
    logUpdate("Order", originalOrder, updatedOrder, currentUser, request);

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
const handleOrderDeletion = async (unifiedParams, request) => {
  try {
    const currentUser = await getAuthenticatedUser();

    // Only admin can delete orders
    if (!hasRole(currentUser, ["admin"])) {
      return forbidden("INSUFFICIENT_PERMISSIONS");
    }

    // Validate organization exists
    const organization = await validateOrganizationExists(currentUser);
    if (!organization || organization.error) return organization;

    const { id: orderId } = unifiedParams;

    // Find the order restricted by organization
    const order = await Order.findOneAndDelete({
      _id: orderId,
      organizationId: organization._id,
    });

    if (!order) {
      return notFound("ORDER_NOT_FOUND");
    }

    // Non-blocking Audit
    logDelete("Order", order, currentUser, request);

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
export const PUT = createPutHandler(orderSchema, handleOrderUpdate);

/**
 * DELETE /api/dashboard/orders/[id]
 * Delete an order
 */
export const DELETE = createDeleteHandler(handleOrderDeletion);
