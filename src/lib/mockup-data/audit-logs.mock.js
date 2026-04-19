export const mockAuditLogs = [
  {
    id: "al_001",
    action: "LOGIN",
    resource: "User",
    resourceId: "demo_user_001",
    userEmail: "admin@demo.com",
    userRole: "admin",
    description: "User logged in successfully",
    ipAddress: "192.168.1.1",
    userAgent: "Mozilla/5.0",
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: "al_002",
    action: "CREATE",
    resource: "Order",
    resourceId: "ord_1001",
    userEmail: "staff@demo.com",
    userRole: "staff",
    description: "Order #1001 created",
    ipAddress: "192.168.1.5",
    userAgent: "Mozilla/5.0",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "al_003",
    action: "UPDATE",
    resource: "Product",
    resourceId: "item_005",
    userEmail: "admin@demo.com",
    userRole: "admin",
    description: "Updated price for Classic Burger",
    ipAddress: "192.168.1.1",
    userAgent: "Mozilla/5.0",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];

export const mockAuditLogStats = {
  totalLogs: mockAuditLogs.length,
  recentActions: 3,
};
