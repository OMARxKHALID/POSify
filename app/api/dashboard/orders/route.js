import { Order } from "@/models/order";
import {
  getAuthenticatedUser,
  hasRole,
  createMethodHandler,
  createGetHandler,
  apiSuccess,
  forbidden,
  serverError,
  validateOrganizationExists,
  formatOrderForResponse,
} from "@/lib/api";

/**
 * Handle orders data request with role-based access control
 */
const handleOrdersData = async (queryParams, request) => {
  try {
    const currentUser = await getAuthenticatedUser();

    // Only admin and staff can access orders
    if (!hasRole(currentUser, ["admin", "staff"])) {
      return forbidden("INSUFFICIENT_PERMISSIONS");
    }

    // Validate organization exists
    const organization = await validateOrganizationExists(currentUser);
    if (!organization || organization.error) return organization;

    const {
      page = 1,
      limit = 20,
      status,
      paymentMethod,
      deliveryType,
      startDate,
      endDate,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = queryParams;

    // Build filter object
    const filter = { organizationId: organization._id };

    if (status) filter.status = status;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (deliveryType) filter.deliveryType = deliveryType;

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Search filter
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
        { mobileNumber: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const [orders, totalCount] = await Promise.all([
      Order.find(filter)
        .populate("servedBy", "name email")
        .populate("items.menuItem", "name price image")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Order.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalCount / parseInt(limit));
    const formattedOrders = orders.map(formatOrderForResponse);

    return apiSuccess("ORDERS_RETRIEVED_SUCCESSFULLY", {
      orders: formattedOrders,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1,
      },
      organization: { id: organization._id, name: organization.name },
      currentUser: {
        id: currentUser._id,
        role: currentUser.role,
        organizationId: currentUser.organizationId,
      },
    });
  } catch (error) {
    return serverError("ORDERS_RETRIEVAL_FAILED");
  }
};

/**
 * GET /api/dashboard/orders
 * Get orders based on authenticated user's role and permissions
 */
export const GET = createGetHandler(handleOrdersData);
export const { POST, PUT, DELETE } = createMethodHandler(["GET"]);