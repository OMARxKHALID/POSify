/**
 * Mockup Data for Analytics Dashboard
 * Contains sample data for charts, tables, and metrics
 */

// Sales Analytics Data
export const salesData = {
  // Daily sales for the last 30 days
  dailySales: [
    { date: "2024-01-01", sales: 1250, orders: 45, customers: 38 },
    { date: "2024-01-02", sales: 1890, orders: 62, customers: 52 },
    { date: "2024-01-03", sales: 2100, orders: 71, customers: 58 },
    { date: "2024-01-04", sales: 1750, orders: 58, customers: 47 },
    { date: "2024-01-05", sales: 2300, orders: 78, customers: 65 },
    { date: "2024-01-06", sales: 2800, orders: 95, customers: 78 },
    { date: "2024-01-07", sales: 3200, orders: 108, customers: 89 },
    { date: "2024-01-08", sales: 1950, orders: 64, customers: 53 },
    { date: "2024-01-09", sales: 2200, orders: 73, customers: 61 },
    { date: "2024-01-10", sales: 2600, orders: 87, customers: 72 },
    { date: "2024-01-11", sales: 2400, orders: 81, customers: 67 },
    { date: "2024-01-12", sales: 2900, orders: 98, customers: 82 },
    { date: "2024-01-13", sales: 3100, orders: 105, customers: 87 },
    { date: "2024-01-14", sales: 3500, orders: 118, customers: 95 },
    { date: "2024-01-15", sales: 1800, orders: 59, customers: 49 },
    { date: "2024-01-16", sales: 2100, orders: 71, customers: 58 },
    { date: "2024-01-17", sales: 2500, orders: 84, customers: 69 },
    { date: "2024-01-18", sales: 2700, orders: 91, customers: 75 },
    { date: "2024-01-19", sales: 3000, orders: 102, customers: 84 },
    { date: "2024-01-20", sales: 3300, orders: 112, customers: 92 },
    { date: "2024-01-21", sales: 3600, orders: 122, customers: 98 },
    { date: "2024-01-22", sales: 2000, orders: 67, customers: 55 },
    { date: "2024-01-23", sales: 2300, orders: 78, customers: 64 },
    { date: "2024-01-24", sales: 2600, orders: 87, customers: 72 },
    { date: "2024-01-25", sales: 2900, orders: 98, customers: 81 },
    { date: "2024-01-26", sales: 3200, orders: 108, customers: 89 },
    { date: "2024-01-27", sales: 3500, orders: 118, customers: 97 },
    { date: "2024-01-28", sales: 3800, orders: 128, customers: 105 },
    { date: "2024-01-29", sales: 2200, orders: 74, customers: 61 },
    { date: "2024-01-30", sales: 2500, orders: 84, customers: 69 },
  ],

  // Hourly sales for today
  hourlySales: [
    { hour: "06:00", sales: 120, orders: 3 },
    { hour: "07:00", sales: 180, orders: 4 },
    { hour: "08:00", sales: 320, orders: 8 },
    { hour: "09:00", sales: 450, orders: 12 },
    { hour: "10:00", sales: 380, orders: 10 },
    { hour: "11:00", sales: 520, orders: 14 },
    { hour: "12:00", sales: 890, orders: 24 },
    { hour: "13:00", sales: 1200, orders: 32 },
    { hour: "14:00", sales: 680, orders: 18 },
    { hour: "15:00", sales: 420, orders: 11 },
    { hour: "16:00", sales: 350, orders: 9 },
    { hour: "17:00", sales: 580, orders: 15 },
    { hour: "18:00", sales: 950, orders: 25 },
    { hour: "19:00", sales: 1300, orders: 35 },
    { hour: "20:00", sales: 1100, orders: 29 },
    { hour: "21:00", sales: 750, orders: 20 },
    { hour: "22:00", sales: 480, orders: 13 },
    { hour: "23:00", sales: 220, orders: 6 },
  ],

  // Top selling items
  topItems: [
    {
      name: "Grilled Chicken",
      category: "Main Course",
      sales: 1250,
      orders: 45,
      price: 28,
    },

    {
      name: "Caesar Salad",
      category: "Salads",
      sales: 980,
      orders: 35,
      price: 18,
    },
    {
      name: "Coca Cola",
      category: "Beverages",
      sales: 750,
      orders: 150,
      price: 5,
    },
    {
      name: "Chocolate Cake",
      category: "Desserts",
      sales: 680,
      orders: 25,
      price: 22,
    },
    {
      name: "Beef Burger",
      category: "Main Course",
      sales: 620,
      orders: 22,
      price: 24,
    },
    {
      name: "French Fries",
      category: "Appetizers",
      sales: 580,
      orders: 40,
      price: 12,
    },
    {
      name: "Pasta Carbonara",
      category: "Main Course",
      sales: 520,
      orders: 18,
      price: 26,
    },
    {
      name: "Orange Juice",
      category: "Beverages",
      sales: 480,
      orders: 80,
      price: 6,
    },
  ],
};

// Performance Metrics
export const performanceMetrics = {
  // Key performance indicators
  kpis: [
    {
      title: "Total Revenue",
      value: "$42,500",
      change: "+12.5%",
      trend: "up",
      period: "vs last month",
    },
    {
      title: "Total Orders",
      value: "1,250",
      change: "+8.3%",
      trend: "up",
      period: "vs last month",
    },
    {
      title: "Average Order Value",
      value: "$34.00",
      change: "+5.2%",
      trend: "up",
      period: "vs last month",
    },
  ],
};

// Inventory Analytics Data
export const inventoryData = {
  // Low stock items
  lowStock: [
    { item: "Chicken Breast", current: 5, min: 10, category: "Meat" },
    { item: "Tomatoes", current: 8, min: 15, category: "Vegetables" },
    { item: "Olive Oil", current: 2, min: 5, category: "Pantry" },
    { item: "Pasta", current: 12, min: 20, category: "Pantry" },
    { item: "Cheese", current: 6, min: 12, category: "Dairy" },
  ],
};

// Export all data
export const analyticsData = {
  sales: salesData,
  performance: performanceMetrics,
  inventory: inventoryData,
};
