"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/format-utils";

export function MenuItemCard({ item, onItemSelect }) {
  const getCategoryColor = (category) => {
    if (!category) return "bg-muted text-muted-foreground";

    const categoryName =
      typeof category === "string" ? category : category.name || "";

    const colorMap = {
      burger: "bg-amber-100 text-amber-800",
      pizza: "bg-red-100 text-red-800",
      sushi: "bg-green-100 text-green-800",
      drink: "bg-blue-100 text-blue-800",
      dessert: "bg-purple-100 text-purple-800",
      salad: "bg-green-100 text-green-800",
      pasta: "bg-orange-100 text-orange-800",
      appetizer: "bg-yellow-100 text-yellow-800",
    };

    return (
      colorMap[categoryName.toLowerCase()] || "bg-muted text-muted-foreground"
    );
  };

  const getCategoryName = (category) => {
    if (!category) return "Unknown";
    return typeof category === "string" ? category : category.name || "Unknown";
  };

  const getItemIcon = (item) => {
    if (item.icon) return item.icon;

    const categoryName = getCategoryName(item.category).toLowerCase();

    const iconMap = {
      burger: "🍔",
      pizza: "🍕",
      sushi: "🍣",
      drink: "🥤",
      dessert: "🍰",
      salad: "🥗",
      pasta: "🍝",
      appetizer: "🍗",
    };

    return iconMap[categoryName] || "🍽️";
  };

  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-shadow duration-300 w-full cursor-pointer p-0 aspect-square min-w-0"
      onClick={() => onItemSelect?.(item)}
    >
      <CardContent className="p-0 h-full flex flex-col">
        <div className="flex-1 bg-card flex items-center justify-center">
          <span className="text-6xl">{getItemIcon(item)}</span>
        </div>

        <div className="p-3 flex flex-col items-start space-y-2 bg-card">
          <h3 className="text-sm font-semibold text-card-foreground leading-tight line-clamp-2">
            {item.name || "Unnamed Item"}
          </h3>

          <div className="flex items-center justify-between w-full">
            <Badge
              className={cn(
                "text-xs font-medium rounded-full px-2 py-0.5",
                getCategoryColor(item.category)
              )}
            >
              {getCategoryName(item.category)}
            </Badge>
            <p className="text-sm font-bold text-card-foreground">
              {formatCurrency(item.price || 0)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
