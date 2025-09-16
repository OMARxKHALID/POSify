"use client";

import { MenuItemCard } from "./menu-item-card";

export function MenuGrid({
  selectedCategory,
  searchQuery,
  onItemSelect,
  isCartOpen = false,
  menuItems = [],
  isLoading = false,
}) {
  // Helper function to get category ID from various formats
  const getCategoryId = (category) => {
    if (!category) return "";
    if (typeof category === "string") return category;
    if (typeof category === "object" && category.id) return category.id;
    if (typeof category === "object" && category._id) return category._id;
    return "";
  };

  // Filter items based on category and search
  const filteredItems = menuItems.filter((item) => {
    if (!item) return false;

    // Get the category ID from the item's category object or categoryId field
    const itemCategoryId = getCategoryId(item.category) || item.categoryId;

    const matchesCategory =
      selectedCategory === "all" ||
      (itemCategoryId && itemCategoryId === selectedCategory);

    const matchesSearch =
      !searchQuery ||
      (item.name &&
        typeof item.name === "string" &&
        item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.description &&
        typeof item.description === "string" &&
        item.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const getGridCols = () => {
    const baseCols =
      "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";
    return isCartOpen ? baseCols : `${baseCols} 2xl:grid-cols-7`;
  };

  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto">
        <div className={`grid ${getGridCols()} gap-3 p-4 w-full max-w-full`}>
          {[...Array(12)].map((_, idx) => (
            <div key={idx} className="w-full min-w-0">
              <div className="aspect-square bg-muted rounded-lg animate-pulse flex flex-col">
                <div className="flex-1 bg-muted-foreground/10 rounded-t-lg" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-muted-foreground/20 rounded w-3/4" />
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-muted-foreground/20 rounded w-16" />
                    <div className="h-4 bg-muted-foreground/20 rounded w-12" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <div className="h-full overflow-y-auto flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-lg font-semibold mb-2">No items found</h3>
          <p className="text-sm">
            {searchQuery
              ? `No items match "${searchQuery}"`
              : selectedCategory === "all"
              ? "No menu items available"
              : `No items in ${selectedCategory} category`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className={`grid ${getGridCols()} gap-3 p-4 w-full max-w-full`}>
        {filteredItems.map((item) => (
          <div key={item.id || item._id} className="w-full min-w-0">
            <MenuItemCard item={item} onItemSelect={onItemSelect} />
          </div>
        ))}
      </div>
    </div>
  );
}
