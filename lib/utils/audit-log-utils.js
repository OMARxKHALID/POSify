// Audit log utilities for UI formatting
export const getActionBadgeVariant = (action) => {
  if (action.includes("CREATE")) return "default";
  if (action.includes("UPDATE")) return "secondary";
  if (action.includes("DELETE")) return "destructive";
  if (action.includes("LOGIN")) return "outline";
  if (action.includes("LOGOUT")) return "outline";
  return "secondary";
};

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
