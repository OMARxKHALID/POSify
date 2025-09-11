// UI utilities for badges, icons, and formatting
import React from "react";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

// Role badge variants
export const getRoleBadgeVariant = (role) => {
  switch (role) {
    case "super_admin":
      return "default";
    case "admin":
      return "secondary";
    case "staff":
      return "outline";
    case "pending":
      return "destructive";
    default:
      return "outline";
  }
};

// Status badge variants
export const getStatusBadgeVariant = (status) => {
  switch (status) {
    case "active":
      return "default";
    case "inactive":
      return "secondary";
    case "suspended":
      return "destructive";
    default:
      return "outline";
  }
};

// Status icons
export const getStatusIcon = (status) => {
  switch (status) {
    case "active":
      return React.createElement(CheckCircle, {
        className: "h-4 w-4 text-green-500",
      });
    case "inactive":
      return React.createElement(XCircle, {
        className: "h-4 w-4 text-muted-foreground",
      });
    case "suspended":
      return React.createElement(AlertTriangle, {
        className: "h-4 w-4 text-red-500",
      });
    default:
      return React.createElement(XCircle, {
        className: "h-4 w-4 text-muted-foreground",
      });
  }
};

// Format user initials for avatar
export const getUserInitials = (name) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};
