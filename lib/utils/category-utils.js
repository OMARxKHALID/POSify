// Category utility functions for display, formatting, and validation
export const formatItemDisplay = (item, fallbackText = "Unknown") => {
  if (!item) return fallbackText;

  if (item.icon && item.icon.trim()) {
    return `${item.icon} ${item.name}`;
  }

  return item.name;
};

export const formatCategoryDisplay = (category) =>
  formatItemDisplay(category, "Uncategorized");

export const formatCategoryOptions = (categories = []) => {
  const uncategorizedOption = {
    value: "uncategorized",
    label: "Uncategorized",
  };

  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: formatCategoryDisplay(category),
  }));

  return [uncategorizedOption, ...categoryOptions];
};

export const findCategoryById = (categories = [], categoryId) => {
  if (!categoryId || categoryId === "uncategorized") return null;
  return categories.find((category) => category.id === categoryId) || null;
};

export const formatCategoryForAPI = (category) => ({
  id: category._id,
  name: category.name,
  icon: category.icon || "",
  description: category.description || "",
  isActive: category.isActive,
});
