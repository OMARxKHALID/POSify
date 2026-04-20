
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
    value: category._id,
    label: formatCategoryDisplay(category),
  }));

  return [uncategorizedOption, ...categoryOptions];
};

export const findCategoryById = (categories = [], categoryId) => {
  if (!categoryId || categoryId === "uncategorized") return null;
  return categories.find((category) => category._id === categoryId) || null;
};

export const formatCategoryForAPI = (category) => ({
  _id: category._id,
  name: category.name,
  icon: category.icon || "",
  description: category.description || "",
  isActive: category.isActive,
});
