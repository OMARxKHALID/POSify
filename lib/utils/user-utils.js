/**
 * User Utilities
 * Shared functions for user-related operations across components
 */

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
  const React = require("react");
  const { CheckCircle, XCircle, AlertTriangle } = require("lucide-react");

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

// Check if user can edit another user
export const canEditUser = (currentUser, targetUser) => {
  const isCurrentUser = currentUser?.id === targetUser?.id;

  return (
    currentUser?.role === "super_admin" ||
    (currentUser?.role === "admin" && targetUser?.role === "staff") ||
    isCurrentUser
  );
};

// Check if user can delete another user
export const canDeleteUser = (currentUser, targetUser) => {
  const isCurrentUser = currentUser?.id === targetUser?.id;

  return (
    (currentUser?.role === "super_admin" ||
      (currentUser?.role === "admin" && targetUser?.role === "staff")) &&
    !isCurrentUser
  );
};

// Check if user can create users
export const canCreateUsers = (currentUser) => {
  return currentUser?.role === "admin";
};

// Check if user can change role
export const canChangeRole = (currentUser, targetUser) => {
  return (
    currentUser?.role === "super_admin" ||
    (currentUser?.role === "admin" && targetUser?.role === "staff")
  );
};

// Check if user can change status
export const canChangeStatus = (currentUser, targetUser) => {
  const isCurrentUser = currentUser?.id === targetUser?.id;

  return (
    (currentUser?.role === "super_admin" ||
      (currentUser?.role === "admin" && targetUser?.role === "staff")) &&
    !isCurrentUser
  );
};
