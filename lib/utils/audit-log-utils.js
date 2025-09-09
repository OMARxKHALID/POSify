/**
 * Audit Log Utility Functions
 * Helper functions for audit log operations and formatting
 */

/**
 * Get action badge variant based on action type
 */
export const getActionBadgeVariant = (action) => {
  if (action.includes("CREATE")) return "default";
  if (action.includes("UPDATE")) return "secondary";
  if (action.includes("DELETE")) return "destructive";
  if (action.includes("LOGIN")) return "outline";
  if (action.includes("LOGOUT")) return "outline";
  return "secondary";
};

/**
 * Get resource badge variant
 */
export const getResourceBadgeVariant = (resource) => {
  switch (resource.toLowerCase()) {
    case "user":
      return "default";
    case "order":
      return "secondary";
    case "product":
      return "outline";
    case "organization":
      return "destructive";
    default:
      return "secondary";
  }
};

// Note: getRoleBadgeVariant is imported from user-utils to avoid duplication
