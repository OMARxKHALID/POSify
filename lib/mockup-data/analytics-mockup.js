import { format, subDays } from "date-fns";

const today = new Date();

export const mockAnalytics = {
  sales: {
    dailySales: [
      { date: format(subDays(today, 6), "yyyy-MM-dd"), revenue: 1250.00, orders: 18 },
      { date: format(subDays(today, 5), "yyyy-MM-dd"), revenue: 1580.50, orders: 22 },
      { date: format(subDays(today, 4), "yyyy-MM-dd"), revenue: 1420.75, orders: 20 },
      { date: format(subDays(today, 3), "yyyy-MM-dd"), revenue: 1890.25, orders: 26 },
      { date: format(subDays(today, 2), "yyyy-MM-dd"), revenue: 2100.00, orders: 28 },
      { date: format(subDays(today, 1), "yyyy-MM-dd"), revenue: 1950.50, orders: 24 },
      { date: format(today, "yyyy-MM-dd"), revenue: 1845.50, orders: 23 },
    ],
    hourlySales: [
      { hour: "9:00", revenue: 120.00, orders: 4 },
      { hour: "10:00", revenue: 180.50, orders: 6 },
      { hour: "11:00", revenue: 250.00, orders: 8 },
      { hour: "12:00", revenue: 420.75, orders: 12 },
      { hour: "13:00", revenue: 380.00, orders: 10 },
      { hour: "14:00", revenue: 210.25, orders: 7 },
      { hour: "15:00", revenue: 150.00, orders: 5 },
      { hour: "16:00", revenue: 180.50, orders: 6 },
      { hour: "17:00", revenue: 290.00, orders: 9 },
      { hour: "18:00", revenue: 450.75, orders: 14 },
      { hour: "19:00", revenue: 520.00, orders: 15 },
      { hour: "20:00", revenue: 380.50, orders: 11 },
      { hour: "21:00", revenue: 220.25, orders: 8 },
    ],
    topItems: [
      { name: "Ribeye Steak", quantity: 45, revenue: 1484.55 },
      { name: "Margherita Pizza", quantity: 38, revenue: 645.62 },
      { name: "Chicken Pad Thai", quantity: 35, revenue: 524.65 },
      { name: "Grilled Chicken Sandwich", quantity: 32, revenue: 415.68 },
      { name: "Fish and Chips", quantity: 28, revenue: 447.72 },
    ],
  },
  performance: {
    kpis: {
      totalRevenue: 12450.75,
      totalOrders: 156,
      averageOrderValue: 79.81,
      completionRate: 91.03,
      averagePrepTime: 14.2,
      customerSatisfaction: 4.7,
    },
    today: {
      revenue: 1845.50,
      orders: 23,
      avgOrderValue: 80.24,
    },
    thisWeek: {
      revenue: 11037.50,
      orders: 138,
      avgOrderValue: 79.98,
    },
    thisMonth: {
      revenue: 12450.75,
      orders: 156,
      avgOrderValue: 79.81,
    },
  },
  inventory: {
    lowStock: [
      { name: "Ribeye Steak", stock: 3, threshold: 5 },
      { name: "Mango Sticky Rice", stock: 2, threshold: 3 },
      { name: "House Red Wine", stock: 8, threshold: 10 },
      { name: "Spring Rolls", stock: 6, threshold: 8 },
      { name: "Thai Iced Tea", stock: 12, threshold: 15 },
    ],
  },
  revenueByCategory: [
    { category: "Main Courses", revenue: 6250.50, percentage: 50.2 },
    { category: "Beverages", revenue: 1875.75, percentage: 15.1 },
    { category: "Sides", revenue: 1500.00, percentage: 12.0 },
    { category: "Salads", revenue: 875.25, percentage: 7.0 },
    { category: "Desserts", revenue: 750.00, percentage: 6.0 },
  ],
  revenueByPaymentMethod: [
    { method: "Card", revenue: 8450.50, percentage: 67.9 },
    { method: "Cash", revenue: 3200.25, percentage: 25.7 },
    { method: "Digital", revenue: 800.00, percentage: 6.4 },
  ],
  revenueByDeliveryType: [
    { type: "Dine-in", revenue: 5625.34, percentage: 45.2 },
    { type: "Takeout", revenue: 4375.26, percentage: 35.1 },
    { type: "Delivery", revenue: 2450.15, percentage: 19.7 },
  ],
};