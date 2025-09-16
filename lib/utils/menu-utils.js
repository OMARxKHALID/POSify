/**
 * Menu utility functions
 */

import {
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  DEFAULT_CATEGORY_COLOR,
  DEFAULT_CATEGORY_ICON,
} from "@/constants/menu-categories";

/**
 * Get category color class based on category name
 */
export const getCategoryColor = (category) => {
  if (!category) return DEFAULT_CATEGORY_COLOR;

  const categoryName =
    typeof category === "string" ? category : category.name || "";
  return CATEGORY_COLORS[categoryName.toLowerCase()] || DEFAULT_CATEGORY_COLOR;
};

/**
 * Get category name from various formats
 */
export const getCategoryName = (category) => {
  if (!category) return "Unknown";
  return typeof category === "string" ? category : category.name || "Unknown";
};

/**
 * Get item icon based on category or item icon
 */
export const getItemIcon = (item) => {
  if (item.icon) return item.icon;

  const categoryName = getCategoryName(item.category).toLowerCase();
  return CATEGORY_ICONS[categoryName] || DEFAULT_CATEGORY_ICON;
};

/**
 * Get category ID from various formats
 */
export const getCategoryId = (category) => {
  if (!category) return "";
  if (typeof category === "string") return category;
  if (typeof category === "object" && category.id) return category.id;
  if (typeof category === "object" && category._id) return category._id;
  return "";
};
