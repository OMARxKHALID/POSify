"use client";

import { Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function CartHeader({
  totalItems,
  onClearCart,
  onToggleCart,
  isMobile = false,
}) {
  return (
    <div className="flex items-center justify-between p-3 border-b bg-card flex-shrink-0">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <h2 className="text-base font-semibold text-card-foreground">
          Order Cart
        </h2>
        {totalItems > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearCart}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
            title="Clear cart"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {totalItems > 0 && (
          <Badge variant="secondary" className="text-xs">
            {totalItems} item{totalItems !== 1 && "s"}
          </Badge>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCart}
          className="h-7 w-7"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
