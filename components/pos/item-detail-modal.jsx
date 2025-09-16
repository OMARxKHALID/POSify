"use client";

import { useState } from "react";
import { Plus, Clock, DollarSign } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { QuantityControl } from "@/components/ui/quantity-control";
import { useCartStore } from "@/lib/store/use-cart-store";

export function ItemDetailModal({
  open = false,
  onClose = () => {},
  selectedItem = null,
}) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState("");

  const { addToCart } = useCartStore();

  const item = selectedItem || {
    id: 1,
    icon: "🍔",
    name: "Classic Burger",
    description: "Juicy grilled beef patty with lettuce, tomato, and cheese.",
    price: 8.99,
    prepTime: 10,
    available: true,
  };

  const isAvailable = item.available !== false;

  const handleAddToCart = async () => {
    if (!item || !isAvailable) return;

    setIsAdding(true);

    const cartItem = {
      ...item,
      _id: item.id || item._id,
      specialInstructions: specialInstructions.trim(),
    };

    try {
      addToCart(cartItem, quantity);
      setQuantity(1);
      setSpecialInstructions("");
      onClose();
    } catch (error) {
      console.error("Failed to add item to cart:", error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto flex flex-col p-4">
        <DialogHeader className="flex-shrink-0 pb-2">
          <DialogTitle className="text-lg">Item Details</DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 space-y-4 overflow-y-auto pr-1">
            {/* Item Info */}
            <div className="flex items-start gap-3 p-3 bg-muted rounded-md">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-md bg-background flex items-center justify-center text-xl">
                  {item.icon}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm mb-1">{item.name}</h3>

                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {item.description}
                </p>

                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    <span className="font-semibold text-primary">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{item.prepTime || 10} min</span>
                  </div>
                </div>

                {!isAvailable && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    Unavailable
                  </Badge>
                )}
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity</label>
              <QuantityControl
                value={quantity}
                onChange={setQuantity}
                min={1}
                max={99}
                className="justify-start"
              />
            </div>

            {/* Special Instructions */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Special Instructions
              </label>
              <Textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Special requests..."
                className="min-h-[60px] text-sm"
              />
            </div>

            {/* Total */}
            <div className="bg-muted p-3 rounded-md">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>Total:</span>
                <span className="text-primary">
                  ${(item.price * quantity).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-9"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAddToCart}
              disabled={!isAvailable || isAdding}
              className="flex-1 h-9"
            >
              {isAdding ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-3 w-3 mr-1" />
                  Add to Cart
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
