import { z } from "zod";

export const dailySaleSchema = z.object({
  date: z.string(),
  revenue: z.number(),
  orders: z.number(),
});

export const hourlySaleSchema = z.object({
  hour: z.string(),
  revenue: z.number(),
  orders: z.number(),
});

export const topItemSchema = z.object({
  name: z.string(),
  category: z.string(),
  sales: z.number(),
  orders: z.number(),
  price: z.number(),
});

export const analyticsSalesSchema = z.object({
  dailySales: z.array(dailySaleSchema),
  hourlySales: z.array(hourlySaleSchema),
  topItems: z.array(topItemSchema),
});

const kpiSchema = z.object({
  title: z.string(),
  value: z.string(),
  change: z.string(),
  trend: z.enum(["up", "down", "neutral"]),
  period: z.string(),
});

const inventorySchema = z.object({
  lowStockItems: z.array(z.object({
    name: z.string(),
    quantity: z.number(),
    threshold: z.number(),
  })),
  outOfStock: z.array(z.string()),
});

export const analyticsPerformanceSchema = z.object({
  kpis: z.array(kpiSchema),
  today: z.object({
    revenue: z.number(),
    orders: z.number(),
    avgOrderValue: z.number(),
  }).optional(),
  thisWeek: z.object({
    revenue: z.number(),
    orders: z.number(),
    avgOrderValue: z.number(),
  }).optional(),
  thisMonth: z.object({
    revenue: z.number(),
    orders: z.number(),
    avgOrderValue: z.number(),
  }).optional(),
  inventory: inventorySchema.optional(),
});

export const analyticsSchema = z.object({
  sales: analyticsSalesSchema,
  performance: analyticsPerformanceSchema,
  inventory: inventorySchema.optional(),
  timeRange: z.string().optional(),
  period: z.string().optional(),
});

export const transactionStatsSchema = z.object({
  totalTransactions: z.number(),
  totalRevenue: z.number(),
  averageOrderValue: z.number(),
  completedTransactions: z.number(),
  pendingTransactions: z.number(),
  failedTransactions: z.number(),
  refundedTransactions: z.number(),
  revenueByPaymentMethod: z.record(z.string(), z.number()),
  totalOrders: z.number().optional(),
  todayOrders: z.number().optional(),
  todayRevenue: z.number().optional(),
});