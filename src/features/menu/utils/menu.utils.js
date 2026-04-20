import { CATEGORY_COLORS, CATEGORY_ICONS, DEFAULT_CATEGORY_COLOR, DEFAULT_CATEGORY_ICON } from "@/features/menu/constants/menu-categories.constants";
import { formatCurrency } from "@/lib/utils/display-formatters";

export const getCategoryColor = (category) => {
  if (!category) return DEFAULT_CATEGORY_COLOR;

  const categoryName =
    typeof category === "string" ? category : category.name || "";
  return CATEGORY_COLORS[categoryName.toLowerCase()] || DEFAULT_CATEGORY_COLOR;
};

export const getCategoryName = (category) => {
  if (!category) return "Unknown";
  return typeof category === "string" ? category : category.name || "Unknown";
};

export const getItemIcon = (item) => {
  if (item.icon) return item.icon;

  const categoryName = getCategoryName(item.category).toLowerCase();
  return CATEGORY_ICONS[categoryName] || DEFAULT_CATEGORY_ICON;
};

export const getCategoryId = (category) => {
  if (!category) return "";
  if (typeof category === "string") return category;
  if (typeof category === "object" && category._id) return category._id;
  return "";
};

export const formatMenuItemForAPI = (menuItem) => {
  return {
    _id: menuItem._id,
    name: menuItem.name,
    description: menuItem.description,
    price: menuItem.price,
    image: menuItem.image,
    icon: menuItem.icon,
    available: menuItem.available,
    prepTime: menuItem.prepTime,
    isSpecial: menuItem.isSpecial,
    categoryId: menuItem.categoryId,
    category: menuItem.categoryId,
    organizationId: menuItem.organizationId,
    createdAt: menuItem.createdAt,
    updatedAt: menuItem.updatedAt,
  };
};

export const getAvailabilityStatus = (available) => {
  return available
    ? { text: "Available", variant: "secondary" }
    : { text: "Hidden", variant: "outline" };
};

export const getSpecialStatus = (isSpecial) => {
  return isSpecial
    ? { text: "Special", variant: "default" }
    : { text: "Regular", variant: "secondary" };
};

export const formatPrice = (price, currency = "USD") =>
  formatCurrency(Number(price) || 0, currency);

export const formatPrepTime = (minutes) => `${Number(minutes) || 0} min`;
