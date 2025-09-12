// Menu utility functions for display, formatting, validation, and statistics

export const formatMenuItemForAPI = (menuItem) => ({
  id: menuItem._id,
  organizationId: menuItem.organizationId,
  categoryId: menuItem.categoryId || null,
  name: menuItem.name,
  price: menuItem.price,
  description: menuItem.description || "",
  image: menuItem.image || "",
  icon: menuItem.icon || "",
  available: menuItem.available,
  prepTime: menuItem.prepTime,
  isSpecial: menuItem.isSpecial,
  createdAt: menuItem.createdAt,
  updatedAt: menuItem.updatedAt,
});

export const formatPrice = (price, currency = "$") => {
  if (typeof price !== "number" || isNaN(price)) return `${currency}0.00`;
  return `${currency}${price.toFixed(2)}`;
};

export const formatPrepTime = (prepTime) => {
  if (typeof prepTime !== "number" || isNaN(prepTime)) return "0 min";
  if (prepTime === 0) return "Ready";
  if (prepTime === 1) return "1 min";
  return `${prepTime} mins`;
};

export const getAvailabilityStatus = (available) => {
  if (available) {
    return {
      text: "Available",
      variant: "default",
      icon: "check",
    };
  }
  return {
    text: "Unavailable",
    variant: "secondary",
    icon: "x",
  };
};

export const getSpecialStatus = (isSpecial) => {
  if (isSpecial) {
    return {
      text: "Special",
      variant: "destructive",
      icon: "star",
    };
  }
  return {
    text: "Regular",
    variant: "outline",
    icon: "circle",
  };
};
