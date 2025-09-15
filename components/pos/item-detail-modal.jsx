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

  // Use selectedItem or fallback to mock data
  const item = selectedItem || {
    id: 1,
    icon: "🍔",
    name: "Classic Burger",
    description: "Juicy grilled beef patty with lettuce, tomato, and cheese.",
    price: 8.99,
    prepTime: 10,
    available: true,
  };

  // Ensure item is available (default to true if not specified)
  const isAvailable = item.available !== false;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!item || !isAvailable) return;

    setIsAdding(true);

    // Create item with _id for cart store compatibility
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
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>Item Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Item Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center text-2xl">
                    {item.icon}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg mb-1">{item.name}</h3>

                  <p className="text-sm text-muted-foreground mb-2">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-semibold text-primary">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{item.prepTime || 10} min</span>
                    </div>
                  </div>

                  {!isAvailable && (
                    <Badge variant="secondary" className="mt-2">
                      Currently Unavailable
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customization Form */}
          <form onSubmit={handleAddToCart} className="space-y-4">
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

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Edit3 className="h-4 w-4" />
                Special Instructions
              </label>
              <Textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Any special requests or modifications..."
                className="min-h-[80px]"
              />
            </div>

            <Separator />

            {/* Total */}
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total:</span>
              <span className="text-primary">
                ${(item.price * quantity).toFixed(2)}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!isAvailable || isAdding}
                className="flex-1"
              >
                {isAdding ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Cart
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
