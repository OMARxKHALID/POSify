"use client";

import { useState } from "react";
import { Plus, Edit3, Clock, DollarSign } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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

  const handleAddToCart = async (e) => {
    e.preventDefault();
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
      <DialogContent className="max-w-sm mx-auto p-4">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg">Item Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Item Info */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-md bg-muted flex items-center justify-center text-xl">
                    {item.icon}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm mb-1">{item.name}</h3>

                  <p className="text-xs text-muted-foreground mb-1 line-clamp-2">
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
                    <Badge variant="secondary" className="mt-1 text-xs">
                      Unavailable
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customization Form */}
          <form onSubmit={handleAddToCart} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium">Quantity</label>
              <QuantityControl
                value={quantity}
                onChange={setQuantity}
                min={1}
                max={99}
                className="justify-start"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium flex items-center gap-1">
                <Edit3 className="h-3 w-3" />
                Instructions
              </label>
              <Textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Special requests..."
                className="min-h-[60px] text-sm"
              />
            </div>

            <Separator />

            {/* Total */}
            <div className="flex items-center justify-between text-sm font-semibold">
              <span>Total:</span>
              <span className="text-primary">
                ${(item.price * quantity).toFixed(2)}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                size="sm"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!isAvailable || isAdding}
                size="sm"
                className="flex-1"
              >
                {isAdding ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
