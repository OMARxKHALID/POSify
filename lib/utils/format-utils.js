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
