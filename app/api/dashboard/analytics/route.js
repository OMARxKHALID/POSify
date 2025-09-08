import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { User } from "@/models/user";
import { Organization } from "@/models/organization";
import { Order } from "@/models/order";
import { getApiErrorMessages } from "@/lib/helpers/error-messages";
import {
  apiSuccess,
  apiNotFound,
  apiError,
  handleApiError,
  createMethodHandler,
  createGetRouteHandler,
} from "@/lib/api-utils";

/**
 * Helper functions for data processing
 */
const generateEmptyAnalytics = () => ({
  sales: { dailySales: [], hourlySales: [], topItems: [] },
  performance: {
    kpis: [
      {
        title: "Total Revenue",
        value: "$0",
        change: "0%",
        trend: "neutral",
        period: "vs last month",
      },
      {
        title: "Total Orders",
        value: "0",
        change: "0%",
        trend: "neutral",
        period: "vs last month",
      },
      {
        title: "Average Order Value",
        value: "$0.00",
        change: "0%",
        trend: "neutral",
        period: "vs last month",
      },
    ],
  },
  inventory: { lowStock: [] },
});

const calculateKPIs = (totalRevenue, totalOrders, avgOrderValue) => {
  // Mock previous period data (in production, query actual previous period)
  const previousRevenue = totalRevenue * 0.88;
  const previousOrders = Math.floor(totalOrders * 0.92);
  const previousAOV = avgOrderValue * 0.95;

  const revenueChange =
    previousRevenue > 0
      ? (((totalRevenue - previousRevenue) / previousRevenue) * 100).toFixed(1)
      : "0.0";
  const ordersChange =
    previousOrders > 0
      ? (((totalOrders - previousOrders) / previousOrders) * 100).toFixed(1)
      : "0.0";
  const aovChange =
    previousAOV > 0
      ? (((avgOrderValue - previousAOV) / previousAOV) * 100).toFixed(1)
      : "0.0";

  return [
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      change: `+${revenueChange}%`,
      trend: "up",
      period: "vs last month",
    },
    {
      title: "Total Orders",
      value: totalOrders.toLocaleString(),
      change: `+${ordersChange}%`,
      trend: "up",
      period: "vs last month",
    },
    {
      title: "Average Order Value",
      value: `$${avgOrderValue.toFixed(2)}`,
      change: `+${aovChange}%`,
      trend: "up",
      period: "vs last month",
    },
  ];
};

const generateMockInventory = () => [
  { item: "Chicken Breast", current: 5, min: 10, category: "Meat" },
  { item: "Tomatoes", current: 8, min: 15, category: "Vegetables" },
  { item: "Olive Oil", current: 2, min: 5, category: "Pantry" },
  { item: "Pasta", current: 12, min: 20, category: "Pantry" },
  { item: "Cheese", current: 6, min: 12, category: "Dairy" },
];

/**
 * Generate analytics data for the organization
 */
const generateAnalyticsData = async (organizationId, timeRange = "30d") => {
  const now = new Date();
  const daysToShow = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
  const startDate = new Date(now.getTime() - daysToShow * 24 * 60 * 60 * 1000);

  // Get orders with proper status filtering
  const orders = await Order.find({
    organizationId,
    createdAt: { $gte: startDate, $lte: now },
    status: { $nin: ["cancelled", "refund"] },
  }).populate("items.menuItem");

  // Handle empty results
  if (orders.length === 0) {
    return generateEmptyAnalytics();
  }

  // Process data
  const dailySalesMap = new Map();
  const hourlySalesMap = new Map();
  const topItemsMap = new Map();
  let totalRevenue = 0;
  let totalOrders = orders.length;

  // Initialize time slots
  for (let i = 0; i < daysToShow; i++) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    const dateKey = date.toISOString().split("T")[0];
    dailySalesMap.set(dateKey, {
      date: dateKey,
      sales: 0,
      orders: 0,
      customers: 0,
    });
  }

  for (let hour = 0; hour < 24; hour++) {
    const hourKey = hour.toString().padStart(2, "0") + ":00";
    hourlySalesMap.set(hourKey, { hour: hourKey, sales: 0, orders: 0 });
  }

  // Process orders
  orders.forEach((order) => {
    const orderDate = new Date(order.createdAt);
    const dateKey = orderDate.toISOString().split("T")[0];
    const hourKey = orderDate.getHours().toString().padStart(2, "0") + ":00";

    // Update daily sales
    const dailyData = dailySalesMap.get(dateKey);
    if (dailyData) {
      dailyData.sales += order.total; // Use 'total' field from Order model
      dailyData.orders += 1;
      dailyData.customers += 1;
    }

    // Update hourly sales
    const hourlyData = hourlySalesMap.get(hourKey);
    if (hourlyData) {
      hourlyData.sales += order.total; // Use 'total' field from Order model
      hourlyData.orders += 1;
    }

    // Process top items
    order.items.forEach((item) => {
      if (item.menuItem) {
        const itemName = item.menuItem.name;
        if (!topItemsMap.has(itemName)) {
          topItemsMap.set(itemName, {
            name: itemName,
            category: item.menuItem.category || "Other",
            sales: 0,
            orders: 0,
            price: item.menuItem.price,
          });
        }
        const itemData = topItemsMap.get(itemName);
        itemData.sales += item.price * item.quantity;
        itemData.orders += item.quantity;
      }
    });

    totalRevenue += order.total; // Use 'total' field from Order model
  });

  // Convert to arrays and sort
  const dailySales = Array.from(dailySalesMap.values()).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const hourlySales = Array.from(hourlySalesMap.values()).sort((a, b) =>
    a.hour.localeCompare(b.hour)
  );

  const topItems = Array.from(topItemsMap.values())
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 8);

  // Calculate KPIs
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const kpis = calculateKPIs(totalRevenue, totalOrders, avgOrderValue);
  const lowStock = generateMockInventory();

  return {
    sales: {
      dailySales,
      hourlySales,
      topItems,
    },
    performance: {
      kpis,
    },
    inventory: {
      lowStock,
    },
  };
};

/**
 * Validate time range parameter
 */
const validateTimeRange = (timeRange) => {
  return ["7d", "30d", "90d"].includes(timeRange);
};

/**
 * Business logic handler for analytics data
 * Returns comprehensive analytics data for the authenticated user's organization
 */
const handleAnalyticsData = async (queryParams, request) => {
  // Get authenticated session
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("AUTHENTICATION_REQUIRED");
  }

  // Find user with basic info
  const user = await User.findById(session.user.id).select(
    "-password -inviteToken -__v"
  );

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  // Get and validate time range
  const timeRange = queryParams.timeRange || "30d";
  if (!validateTimeRange(timeRange)) {
    throw new Error("INVALID_TIME_RANGE");
  }

  // For super_admin users, return empty analytics
  if (user.role === "super_admin") {
    return NextResponse.json(
      apiSuccess({
        data: generateEmptyAnalytics(),
        message: "Analytics data retrieved successfully (super admin)",
      }),
      { status: 200 }
    );
  }

  // For admin/staff users, validate organization
  if (!user.organizationId) {
    throw new Error("ORGANIZATION_NOT_FOUND");
  }

  // Verify organization exists
  const organization = await Organization.findById(user.organizationId).select(
    "-__v"
  );

  if (!organization) {
    throw new Error("ORGANIZATION_NOT_FOUND");
  }

  // Generate analytics data
  const analyticsData = await generateAnalyticsData(
    user.organizationId,
    timeRange
  );

  return NextResponse.json(
    apiSuccess({
      data: analyticsData,
      message: "Analytics data retrieved successfully",
    }),
    { status: 200 }
  );
};

/**
 * GET /api/dashboard/analytics
 * Get analytics data for the authenticated user's organization
 * Returns sales data, performance metrics, and inventory information
 */
export const GET = createGetRouteHandler(async (queryParams, request) => {
  try {
    return await handleAnalyticsData(queryParams, request);
  } catch (error) {
    // Handle specific authentication and data errors
    switch (error.message) {
      case "AUTHENTICATION_REQUIRED":
        return NextResponse.json(
          apiError(getApiErrorMessages("AUTHENTICATION_REQUIRED")),
          {
            status: 401,
          }
        );
      case "USER_NOT_FOUND":
        return NextResponse.json(
          apiNotFound(getApiErrorMessages("USER_NOT_FOUND")),
          { status: 404 }
        );
      case "ORGANIZATION_NOT_FOUND":
        return NextResponse.json(
          apiNotFound(getApiErrorMessages("ORGANIZATION_NOT_FOUND")),
          { status: 404 }
        );
      case "INVALID_TIME_RANGE":
        return NextResponse.json(
          apiError(getApiErrorMessages("INVALID_TIME_RANGE")),
          { status: 400 }
        );
      default:
        // Handle other errors
        return NextResponse.json(
          handleApiError(error, getApiErrorMessages("OPERATION_FAILED")),
          { status: 500 }
        );
    }
  }
});

// Fallback for unsupported HTTP methods
export const { POST, PUT, DELETE } = createMethodHandler(["GET"]);
