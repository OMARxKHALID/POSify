


export const normalizeItemId = (item) => {
  if (!item) return null;
  return item._id || item.id || null;
};


export const normalizeCategoryId = (category) => {
  if (!category) return null;
  return category._id || category.id || null;
};


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

    id: undefined,
  };
};


export const itemsHaveSameId = (item1, item2) => {
  const id1 = normalizeItemId(item1);
  const id2 = normalizeItemId(item2);
  return id1 && id2 && id1 === id2;
};


export const findItemById = (items, targetId) => {
  if (!items || !Array.isArray(items)) return null;

  const searchId =
    typeof targetId === "string" ? targetId : normalizeItemId(targetId);
  if (!searchId) return null;

  return items.find((item) => normalizeItemId(item) === searchId) || null;
};



export const filterItemsById = (items, targetId) => {
  if (!items || !Array.isArray(items)) return [];

  const searchId =
    typeof targetId === "string" ? targetId : normalizeItemId(targetId);
  if (!searchId) return items;

  return items.filter((item) => normalizeItemId(item) !== searchId);
};

export function generateIdempotencyKey() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
