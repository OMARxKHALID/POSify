/**
 * Response Helpers
 * Centralized response formatting utilities for API routes
 */

/**
 * Format user data for response (excludes sensitive fields)
 */
export const formatUserData = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  permissions: user.permissions,
  lastLogin: user.lastLogin,
  emailVerified: user.emailVerified,
  createdAt: user.createdAt,
  organizationId: user.organizationId,
});

/**
 * Format audit log data for response
 */
export const formatAuditLogData = (auditLog) => ({
  id: auditLog._id,
  action: auditLog.action,
  resource: auditLog.resource,
  resourceId: auditLog.resourceId,
  userId: auditLog.userId,
  userEmail: auditLog.userEmail,
  userRole: auditLog.userRole,
  organizationId: auditLog.organizationId,
  ipAddress: auditLog.ipAddress,
  userAgent: auditLog.userAgent,
  changes: auditLog.changes,
  description: auditLog.description,
  metadata: auditLog.metadata,
  createdAt: auditLog.createdAt,
  updatedAt: auditLog.updatedAt,
});

/**
 * Format organization data for response
 */
export const formatOrganizationData = (organization) => ({
  id: organization._id,
  name: organization.name,
  slug: organization.slug,
  domain: organization.domain,
  status: organization.status,
  businessType: organization.businessType,
  information: organization.information,
  subscription: organization.subscription,
  limits: organization.limits,
  usage: organization.usage,
  onboardingCompleted: organization.onboardingCompleted,
  createdAt: organization.createdAt,
  updatedAt: organization.updatedAt,
  owner: organization.owner
    ? {
        id: organization.owner._id,
        name: organization.owner.name,
        email: organization.owner.email,
        role: organization.owner.role,
        status: organization.owner.status,
        lastLogin: organization.owner.lastLogin,
        createdAt: organization.owner.createdAt,
      }
    : null,
});

/**
 * Clean user response (remove sensitive fields)
 */
export const cleanUserResponse = (user) => {
  const userResponse = user.toJSON ? user.toJSON() : { ...user };
  delete userResponse.password;
  delete userResponse.inviteToken;
  delete userResponse.__v;
  return userResponse;
};
