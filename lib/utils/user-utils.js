// User utilities for permission checking
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
