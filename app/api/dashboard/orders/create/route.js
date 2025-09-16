import { Order } from "@/models/order";
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
} from "@/lib/api";
import { orderSchema } from "@/schemas/order-schema";

/**
 * Handle order creation with role-based access control
 */
const handleOrderCreation = async (validatedData, request) => {
  try {
    console.log("🔄 [DEBUG] Order Creation API - Starting order creation:", {
      validatedData: {
        organizationId: validatedData.organizationId,
        itemsCount: validatedData.items?.length,
        total: validatedData.total,
        customerName: validatedData.customerName,
        paymentMethod: validatedData.paymentMethod,
        items: validatedData.items?.map((item) => ({
          menuItem: item.menuItem,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount,
          prepTime: item.prepTime,
        })),
        tax: validatedData.tax,
        deliveryInfo: validatedData.deliveryInfo,
        status: validatedData.status,
        deliveryType: validatedData.deliveryType,
      },
    });

    const currentUser = await getAuthenticatedUser();
    console.log("🔄 [DEBUG] Order Creation API - Current user:", {
      userId: currentUser._id,
      role: currentUser.role,
      organizationId: currentUser.organizationId,
    });

    // Only admin and staff can create orders
    if (!hasRole(currentUser, ["admin", "staff"])) {
      console.log("🔄 [DEBUG] Order Creation API - Insufficient permissions");
      return forbidden("INSUFFICIENT_PERMISSIONS");
    }

    // Validate organization exists
    const organization = await validateOrganizationExists(currentUser);
    console.log("🔄 [DEBUG] Order Creation API - Organization validation:", {
      organization: organization
        ? {
            id: organization._id,
            name: organization.name,
          }
        : null,
      hasError: !!organization?.error,
    });

    if (!organization || organization.error) return organization;

    // Create order with validation and enrichment
    const order = await createOrderWithValidation(
      organization._id,
      validatedData,
      currentUser._id
    );

    // Log the creation
    await logCreate("Order", order, currentUser, request);

    // Populate the created order
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
    console.error("Order creation error:", error);

    const errorInfo = handleOrderValidationError(error);

    if (errorInfo.type === "validation") {
      return badRequest(errorInfo.message);
    }

    if (errorInfo.type === "duplicate") {
      return badRequest(errorInfo.message);
    }

    // Log the full error for debugging
    console.error("Order creation failed:", {
      error: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name,
    });

    return serverError("ORDER_CREATION_FAILED");
  }
};

/**
 * POST /api/dashboard/orders/create
 * Create a new order (admin and staff only)
 */
export const POST = createPostHandler(orderSchema, handleOrderCreation);
export const { GET, PUT, DELETE } = createMethodHandler(["POST"]);
