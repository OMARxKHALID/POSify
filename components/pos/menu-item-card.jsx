"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function MenuItemCard({ item, onItemSelect }) {
  const getCategoryColor = (category) => {
    switch (category.toLowerCase()) {
      case "burger":
        return "bg-amber-100 text-amber-800";
      case "pizza":
        return "bg-red-100 text-red-800";
      case "sushi":
        return "bg-green-100 text-green-800";
      case "drink":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-shadow duration-300 w-full cursor-pointer p-0 aspect-square min-w-0"
      onClick={() => onItemSelect?.(item)}
    >
      <CardContent className="p-0 h-full flex flex-col">
        <div className="flex-1 bg-card flex items-center justify-center">
          <span className="text-4xl">{item.icon}</span>
        </div>

        <div className="p-3 flex flex-col items-start space-y-2 bg-card">
          <h3 className="text-sm font-semibold text-card-foreground leading-tight line-clamp-2">
            {item.name}
          </h3>

          <div className="flex items-center justify-between w-full">
            <Badge
              className={cn(
                "text-xs font-medium rounded-full px-2 py-0.5",
                getCategoryColor(item.category)
              )}
            >
              {item.category}
            </Badge>
            <p className="text-sm font-bold text-card-foreground">
              ${item.price.toFixed(2)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
