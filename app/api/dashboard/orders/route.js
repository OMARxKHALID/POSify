import mongoose from "mongoose";
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

import { z } from "zod";

/**
 * Zod schema for orders query validation
 */
const ordersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.string().optional(),
  paymentMethod: z.string().optional(),
  deliveryType: z.string().optional(),
  startDate: z.string().datetime().optional().or(z.string().length(10).optional()),
  endDate: z.string().datetime().optional().or(z.string().length(10).optional()),
  search: z.string().optional(),
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

/**
 * Handle orders data request with role-based access control
 */
const handleOrdersData = async (queryParams, request) => {
  try {
    const validatedParams = ordersQuerySchema.safeParse(queryParams);
    if (!validatedParams.success) {
      return badRequest("INVALID_QUERY_PARAMS");
    }

    const {
      page,
      limit,
      status,
      paymentMethod,
      deliveryType,
      startDate,
      endDate,
      search,
      sortBy,
      sortOrder,
    } = validatedParams.data;

    const currentUser = await getAuthenticatedUser();

    // Only admin and staff can access orders
    if (!hasRole(currentUser, ["admin", "staff"])) {
      return forbidden("INSUFFICIENT_PERMISSIONS");
    }

    // Validate organization exists
    const organization = await validateOrganizationExists(currentUser);
    if (!organization || organization.error) return organization;

    // Build filter object with strict ObjectId casting
    const filter = { organizationId: new mongoose.Types.ObjectId(organization._id.toString()) };

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

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    // Optimized Single-Trip Aggregation
    const [result] = await Order.aggregate([
      { $match: filter },
      { $sort: sort },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: "users",
                localField: "servedBy",
                foreignField: "_id",
                as: "servedByInfo",
              },
            },
            // Logic to populate items.menuItem details in aggregation
            {
              $unwind: {
                path: "$items",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $lookup: {
                from: "menus", // Assuming collection name is 'menus'
                localField: "items.menuItem",
                foreignField: "_id",
                as: "items.menuItemDetail"
              }
            },
            {
              $addFields: {
                "items.menuItem": { $arrayElemAt: ["$items.menuItemDetail", 0] }
              }
            },
            {
              $group: {
                _id: "$_id",
                items: { $push: "$items" },
                // Preserve other fields
                orderNumber: { $first: "$orderNumber" },
                organizationId: { $first: "$organizationId" },
                customerName: { $first: "$customerName" },
                mobileNumber: { $first: "$mobileNumber" },
                status: { $first: "$status" },
                total: { $first: "$total" },
                subtotal: { $first: "$subtotal" },
                tax: { $first: "$tax" },
                discount: { $first: "$discount" },
                promoDiscount: { $first: "$promoDiscount" },
                serviceCharge: { $first: "$serviceCharge" },
                tip: { $first: "$tip" },
                paymentMethod: { $first: "$paymentMethod" },
                isPaid: { $first: "$isPaid" },
                deliveryType: { $first: "$deliveryType" },
                servedByInfo: { $first: "$servedByInfo" },
                refundStatus: { $first: "$refundStatus" },
                returns: { $first: "$returns" },
                deliveryInfo: { $first: "$deliveryInfo" },
                idempotencyKey: { $first: "$idempotencyKey" },
                createdAt: { $first: "$createdAt" },
                updatedAt: { $first: "$updatedAt" }
              }
            },
            { $sort: sort } // Re-sort after group
          ],
        },
      },
    ]);

    const totalCount = result.metadata[0]?.total || 0;
    const orders = result.data.map(o => ({
      ...o,
      servedBy: o.servedByInfo ? o.servedByInfo[0] : null
    }));

    const totalPages = Math.ceil(totalCount / limit);
    const formattedOrders = orders.map(formatOrderForResponse);

    return apiSuccess("ORDERS_RETRIEVED_SUCCESSFULLY", {
      orders: formattedOrders,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit,
      },
      organization: { id: organization._id, name: organization.name },
      currentUser: {
        id: currentUser._id,
        role: currentUser.role,
        organizationId: currentUser.organizationId,
      },
    });
  } catch (error) {
    console.error("Orders Fetch Error:", error);
    return serverError("ORDERS_RETRIEVAL_FAILED");
  }
};

/**
 * GET /api/dashboard/orders
 * Get orders based on authenticated user's role and permissions
 */
export const GET = createGetHandler(handleOrdersData);
export const { POST, PUT, DELETE } = createMethodHandler(["GET"]);