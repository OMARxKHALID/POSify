"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/format-utils";
import {
  getCategoryColor,
  getCategoryName,
  getItemIcon,
} from "@/lib/utils/menu-utils";
import { normalizeItem } from "@/lib/utils/common-utils";

export function MenuItemCard({ item, onItemSelect }) {
  // Normalize item to ensure consistent ID field
  const normalizedItem = normalizeItem(item);
  
  if (!normalizedItem) {
    return null;
  }
  
  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-shadow duration-300 w-full cursor-pointer p-0 aspect-square min-w-0"
      onClick={() => onItemSelect?.(normalizedItem)}
    >
      <CardContent className="p-0 h-full flex flex-col">
        <div className="flex-1 bg-card flex items-center justify-center">
          <span className="text-6xl">{getItemIcon(normalizedItem)}</span>
        </div>

        <div className="p-3 flex flex-col items-start space-y-2 bg-card">
          <h3 className="text-sm font-semibold text-card-foreground leading-tight line-clamp-2">
            {normalizedItem.name || "Unnamed Item"}
          </h3>

          <div className="flex items-center justify-between w-full">
            <Badge
              className={cn(
                "text-xs font-medium rounded-full px-2 py-0.5",
                getCategoryColor(normalizedItem.category)
              )}
            >
              {getCategoryName(normalizedItem.category)}
            </Badge>
            <p className="text-sm font-bold text-card-foreground">
              {formatCurrency(normalizedItem.price || 0)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
