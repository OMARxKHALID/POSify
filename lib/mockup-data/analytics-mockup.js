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
      { name: "Ribeye Steak", category: "Main Courses", sales: 1484.55, orders: 45, price: 32.99 },
      { name: "Margherita Pizza", category: "Main Courses", sales: 645.62, orders: 38, price: 16.99 },
      { name: "Chicken Pad Thai", category: "Main Courses", sales: 524.65, orders: 35, price: 14.99 },
      { name: "Grilled Chicken Sandwich", category: "Main Courses", sales: 415.68, orders: 32, price: 12.99 },
      { name: "Fish and Chips", category: "Main Courses", sales: 447.72, orders: 28, price: 15.99 },
    ],
  },
  performance: {
    kpis: [
      {
        title: "Total Revenue",
        value: "$12,450.75",
        change: "+15.2%",
        trend: "up",
        period: "vs last month",
      },
      {
        title: "Total Orders",
        value: "156",
        change: "+8.5%",
        trend: "up",
        period: "vs last month",
      },
      {
        title: "Avg Order Value",
        value: "$79.81",
        change: "+2.1%",
        trend: "up",
        period: "vs last month",
      },
      {
        title: "Completion Rate",
        value: "91.03%",
        change: "-1.2%",
        trend: "down",
        period: "vs last month",
      },
    ],
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
      { item: "Ribeye Steak", category: "Main Courses", current: 3, min: 5 },
      { item: "Mango Sticky Rice", category: "Desserts", current: 2, min: 3 },
      { item: "House Red Wine", category: "Beverages", current: 8, min: 10 },
      { item: "Spring Rolls", category: "Sides", current: 6, min: 8 },
      { item: "Thai Iced Tea", category: "Beverages", current: 12, min: 15 },
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