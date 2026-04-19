"use client";

import { cn } from "@/lib/utils/ui.utils";

export function CategoryNav({
  selectedCategory,
  onCategoryChange,
  categories = [],
  menuItems = [],
  isLoading = false,
}) {

  const getCategoryItemCount = (categoryId) => {
    if (categoryId === "all") {
      return menuItems.length;
    }
    return menuItems.filter((item) => {

      const itemCategoryId =
        (item.category && (item.category.id || item.category._id)) ||
        item.categoryId ||
        (typeof item.category === "string" ? item.category : null);
      return itemCategoryId === categoryId;
    }).length;
  };


  const allCategory = {
    id: "all",
    name: "All",
    icon: "🍽️",
    count: getCategoryItemCount("all"),
  };


  const categoriesWithCount = categories.map((cat) => ({
    ...cat,
    id: cat.id || cat._id, 
    count: getCategoryItemCount(cat.id || cat._id),
  }));

  const displayCategories = [allCategory, ...categoriesWithCount];


  if (isLoading || categories.length === 0) {
    return (
      <div className="flex gap-2 mb-2 pb-3 overflow-x-auto scrollbar-hide max-w-full">
        {[...Array(5)].map((_, idx) => (
          <div
            key={idx}
            className="flex flex-col justify-between items-start p-2 rounded-2xl w-[105px] h-[115px] border-2 flex-shrink-0 bg-muted animate-pulse"
          >
            <div className="mb-3">
              <div className="flex items-center justify-center rounded-full w-9 h-9 bg-muted-foreground/20" />
            </div>
            <div className="flex flex-col w-full text-left">
              <div className="h-3 bg-muted-foreground/20 rounded mb-1 w-16" />
              <div className="h-2 bg-muted-foreground/20 rounded w-12" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2 mb-2 pb-3 overflow-x-auto scrollbar-hide max-w-full">
      {displayCategories.map((cat, idx) => {
        const selected = selectedCategory === cat.id;
        return (
          <button
            key={cat.id || `cat-${idx}`}
            type="button"
            onClick={() => onCategoryChange?.(cat.id)}
            className={cn(
              "flex flex-col justify-between items-start p-2 rounded-2xl transition-all duration-200 w-[105px] h-[115px] border-2 flex-shrink-0 hover:shadow",
              selected
                ? "bg-primary/10 border-primary"
                : "bg-card border-border"
            )}
          >
            <div className="mb-1">
              <div
                className={cn(
                  "flex items-center justify-center rounded-full w-9 h-9",
                  selected ? "bg-primary" : "bg-muted"
                )}
              >
                <span
                  className={cn(
                    "text-xl",
                    selected
                      ? "text-lg text-primary-foreground"
                      : "text-lg text-muted-foreground"
                  )}
                >
                  {cat.icon}
                </span>
              </div>
            </div>

            <div className="flex flex-col w-full text-left">
              <h3 className="text-card-foreground font-medium text-xs mb-1 leading-tight line-clamp-2 break-words">
                {cat.name}
              </h3>
              <p className="text-xs text-muted-foreground whitespace-nowrap">
                {cat.count} Items
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
