// Generic API data formatting utilities for consistent response structures
export const formatApiData = (document, fieldMapping = {}) => {
  const formatted = { id: document._id };

  Object.entries(fieldMapping).forEach(([key, value]) => {
    if (typeof value === "function") {
      formatted[key] = value(document);
    } else if (typeof value === "string") {
      formatted[key] = document[value] || null;
    } else {
      formatted[key] = document[key] || null;
    }
  });

  return formatted;
};

export const formatUserData = (user) =>
  formatApiData(user, {
    name: "name",
    email: "email",
    role: "role",
    status: "status",
    permissions: "permissions",
    lastLogin: "lastLogin",
    emailVerified: "emailVerified",
    createdAt: "createdAt",
    organizationId: "organizationId",
  });

export const formatAuditLogData = (auditLog) =>
  formatApiData(auditLog, {
    action: "action",
    resource: "resource",
    resourceId: "resourceId",
    userId: "userId",
    userEmail: "userEmail",
    userRole: "userRole",
    organizationId: "organizationId",
    ipAddress: "ipAddress",
    userAgent: "userAgent",
    changes: "changes",
    description: "description",
    metadata: "metadata",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  });

export const formatOrganizationData = (organization) =>
  formatApiData(organization, {
    name: "name",
    slug: "slug",
    domain: "domain",
    status: "status",
    businessType: "businessType",
    information: "information",
    subscription: "subscription",
    limits: "limits",
    usage: "usage",
    onboardingCompleted: "onboardingCompleted",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    owner: (doc) =>
      doc.owner
        ? {
            id: doc.owner._id,
            name: doc.owner.name,
            email: doc.owner.email,
            role: doc.owner.role,
            status: doc.owner.status,
            lastLogin: doc.owner.lastLogin,
            createdAt: doc.owner.createdAt,
          }
        : null,
  });

export const formatOrderData = (order) =>
  formatApiData(order, {
    orderNumber: "orderNumber",
    refundNumber: "refundNumber",
    items: "items",
    customerName: "customerName",
    mobileNumber: "mobileNumber",
    deliveryType: "deliveryType",
    servedBy: "servedBy",
    subtotal: "subtotal",
    total: "total",
    paymentMethod: "paymentMethod",
    isPaid: "isPaid",
    status: "status",
    refundStatus: "refundStatus",
    returns: "returns",
    notes: "notes",
    deliveryInfo: "deliveryInfo",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  });

// Date formatting utilities
export const formatDate = (date) => {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatTime = (date) => {
  if (!date) return null;
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatCurrency = (amount, currency = "USD") => {
  if (typeof amount !== "number") return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
};
