import React from "react";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const getRoleBadgeVariant = (role) => {
  switch (role) {
    case "super_admin": return "default";
    case "admin": return "secondary";
    case "staff": return "outline";
    case "pending": return "destructive";
    default: return "outline";
  }
};

export const getStatusBadgeVariant = (status) => {
  switch (status) {
    case "active": return "default";
    case "inactive": return "secondary";
    case "suspended": return "destructive";
    default: return "outline";
  }
};

export const getStatusIcon = (status) => {
  switch (status) {
    case "active":
      return React.createElement(CheckCircle, { className: "h-4 w-4 text-green-500" });
    case "inactive":
      return React.createElement(XCircle, { className: "h-4 w-4 text-muted-foreground" });
    case "suspended":
      return React.createElement(AlertTriangle, { className: "h-4 w-4 text-red-500" });
    default:
      return React.createElement(XCircle, { className: "h-4 w-4 text-muted-foreground" });
  }
};

export const getUserInitials = (name) => {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase();
};

export const getAuditActionVariant = (action) => {
  if (!action) return "secondary";
  if (action.includes("CREATE")) return "default";
  if (action.includes("UPDATE")) return "secondary";
  if (action.includes("DELETE")) return "destructive";
  if (action.includes("LOGIN") || action.includes("LOGOUT")) return "outline";
  return "secondary";
};

export const getAuditResourceVariant = (resource) => {
  if (!resource) return "secondary";
  switch (resource.toLowerCase()) {
    case "user": return "default";
    case "order": return "secondary";
    case "product": return "outline";
    case "organization": return "destructive";
    default: return "secondary";
  }
};
