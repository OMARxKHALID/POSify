/**
 * Common utilities for consistent data handling across the POS system
 */

/**
 * Normalize item ID - handles both _id and id fields consistently
 * @param {Object} item - Item object with potential id or _id field
 * @returns {string} - Normalized ID
 */
export const normalizeItemId = (item) => {
  if (!item) return null;
  return item._id || item.id || null;
};

/**
 * Normalize category ID - handles both _id and id fields consistently
 * @param {Object} category - Category object with potential id or _id field
 * @returns {string} - Normalized ID
 */
export const normalizeCategoryId = (category) => {
  if (!category) return null;
  return category._id || category.id || null;
};

/**
 * Create a normalized item object with consistent ID field
 * @param {Object} item - Original item object
 * @returns {Object} - Item with normalized _id field
 */
export const normalizeItem = (item) => {
  if (!item) return null;

  const normalizedId = normalizeItemId(item);
  if (!normalizedId) {
    console.warn("Item missing valid ID:", item);
    return null;
  }

  return {
    ...item,
    _id: normalizedId,
    // Remove duplicate id field if it exists
    id: undefined,
  };
};

/**
 * Check if two items have the same ID
 * @param {Object} item1 - First item
 * @param {Object} item2 - Second item
 * @returns {boolean} - True if items have same ID
 */
export const itemsHaveSameId = (item1, item2) => {
  const id1 = normalizeItemId(item1);
  const id2 = normalizeItemId(item2);
  return id1 && id2 && id1 === id2;
};

/**
 * Find item in array by ID
 * @param {Array} items - Array of items
 * @param {string|Object} targetId - ID string or item object
 * @returns {Object|null} - Found item or null
 */
export const findItemById = (items, targetId) => {
  if (!items || !Array.isArray(items)) return null;

  const searchId =
    typeof targetId === "string" ? targetId : normalizeItemId(targetId);
  if (!searchId) return null;

  return items.find((item) => normalizeItemId(item) === searchId) || null;
};

/**
 * Filter items by ID
 * @param {Array} items - Array of items
 * @param {string|Object} targetId - ID string or item object
 * @returns {Array} - Filtered items
 */
export const filterItemsById = (items, targetId) => {
  if (!items || !Array.isArray(items)) return [];

  const searchId =
    typeof targetId === "string" ? targetId : normalizeItemId(targetId);
  if (!searchId) return items;

  return items.filter((item) => normalizeItemId(item) !== searchId);
};
