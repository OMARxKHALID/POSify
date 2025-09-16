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
    <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide max-w-full pb-3">
      {mockCategories.map((cat, idx) => {
        const selected = selectedCategory === cat.id;
        return (
          <button
            key={cat.id || `cat-${idx}`}
            type="button"
            onClick={() => onCategoryChange?.(cat.id)}
            className={cn(
              "flex flex-col items-start p-2 rounded-2xl transition-all duration-200 w-[105px] h-[105px] border-2 flex-shrink-0 hover:shadow",
              selected
                ? "bg-primary/10 border-primary"
                : "bg-card border-border"
            )}
          >
            <div className="mb-3">
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
