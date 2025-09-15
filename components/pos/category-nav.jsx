"use client";

import { cn } from "@/lib/utils";

export function CategoryNav({ selectedCategory, onCategoryChange }) {
  const mockCategories = [
    { id: "all", name: "All", icon: "🍽️", count: 40 },
    { id: "burger", name: "Burgers", icon: "🍔", count: 5 },
    { id: "pizza", name: "Pizza", icon: "🍕", count: 5 },
    { id: "sushi", name: "Sushi", icon: "🍣", count: 5 },
    { id: "dessert", name: "Desserts", icon: "🍰", count: 5 },
    { id: "drink", name: "Drinks", icon: "🥤", count: 5 },
    { id: "salad", name: "Salads", icon: "🥗", count: 5 },
    { id: "pasta", name: "Pasta", icon: "🍝", count: 5 },
    { id: "appetizer", name: "Appetizers", icon: "🍗", count: 5 },
  ];

  return (
    <div className="flex gap-1 mb-4 overflow-x-auto sm:gap-2 sm:mb-6 scrollbar-hide max-w-full">
      {mockCategories.map((cat, idx) => {
        const selected = selectedCategory === cat.id;
        return (
          <button
            key={cat.id || `cat-${idx}`}
            type="button"
            onClick={() => onCategoryChange?.(cat.id)}
            className={cn(
              "flex flex-col items-start p-2 rounded-2xl transition-all duration-200 w-[90px] h-[90px] sm:w-[105px] sm:h-[105px] border-2 flex-shrink-0 hover:shadow",
              selected
                ? "bg-primary/10 border-primary"
                : "bg-card border-border"
            )}
          >
            <div className="mb-2 sm:mb-3">
              <div
                className={cn(
                  "flex items-center justify-center rounded-full w-7 h-7 sm:w-9 sm:h-9",
                  selected ? "bg-primary" : "bg-muted"
                )}
              >
                <span
                  className={cn(
                    "sm:text-xl",
                    selected
                      ? "text-sm text-primary-foreground sm:text-lg"
                      : "text-lg text-muted-foreground"
                  )}
                >
                  {cat.icon}
                </span>
              </div>
            </div>

            <div className="flex flex-col w-full text-left">
              <h3 className="text-card-foreground font-medium text-[10px] sm:text-xs mb-0.5 sm:mb-1 leading-tight line-clamp-2 break-words">
                {cat.name}
              </h3>
              <p className="text-[9px] sm:text-xs text-muted-foreground whitespace-nowrap">
                {cat.count} Items
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
