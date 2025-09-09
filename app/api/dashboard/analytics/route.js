import { Organization } from "@/models/organization";
import { Order } from "@/models/order";
import {
  getAuthenticatedUser,
  createMethodHandler,
  createGetHandler,
} from "@/lib/api-utils";
import { apiSuccess, badRequest, notFound } from "@/lib/api-utils";

/**
 * Generate empty analytics structure for new organizations
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

/**
 * Calculate KPIs with mock previous period data for comparison
 */
const calculateKPIs = (totalRevenue, totalOrders, avgOrderValue) => {
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

/**
 * Generate mock inventory data for low stock items
 */
const generateMockInventory = () => [
  { item: "Chicken Breast", current: 5, min: 10, category: "Meat" },
  { item: "Tomatoes", current: 8, min: 15, category: "Vegetables" },
  { item: "Olive Oil", current: 2, min: 5, category: "Pantry" },
  { item: "Pasta", current: 12, min: 20, category: "Pantry" },
  { item: "Cheese", current: 6, min: 12, category: "Dairy" },
];

/**
 * Generate comprehensive analytics data for organization orders and sales
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
 * Validate time range parameter against allowed values
 */
const validateTimeRange = (timeRange) => {
  return ["7d", "30d", "90d"].includes(timeRange);
};

/**
 * Handle analytics data request with role-based access control
 */
const handleAnalyticsData = async (queryParams, request) => {
  const user = await getAuthenticatedUser();
  const timeRange = queryParams.timeRange || "30d";

  if (!validateTimeRange(timeRange)) {
    return badRequest("INVALID_TIME_RANGE");
  }

  if (user.role === "super_admin") {
    return apiSuccess(
      "ANALYTICS_RETRIEVED_SUCCESSFULLY_SUPER_ADMIN",
      generateEmptyAnalytics()
    );
  }

  if (!user.organizationId) {
    return notFound("ORGANIZATION_NOT_FOUND");
  }

  const organization = await Organization.findById(user.organizationId).select(
    "-__v"
  );
  if (!organization) {
    return notFound("ORGANIZATION_NOT_FOUND");
  }

  const analyticsData = await generateAnalyticsData(
    user.organizationId,
    timeRange
  );
  return apiSuccess("ANALYTICS_RETRIEVED_SUCCESSFULLY", analyticsData);
};

/**
 * GET /api/dashboard/analytics
 * Get analytics data for the authenticated user's organization
 * Returns sales data, performance metrics, and inventory information
 */
export const GET = createGetHandler(handleAnalyticsData);

// Fallback for unsupported HTTP methods
export const { POST, PUT, DELETE } = createMethodHandler(["GET"]);
