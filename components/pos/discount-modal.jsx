"use client";

import { useState } from "react";
import { Percent, DollarSign } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";

export function DiscountModal({ open = true, onClose = () => {} }) {
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState(0);

  // Mock subtotal
  const subtotal = 50.0;
  const maxDiscountPercentage = 50;

  const discountAmount =
    discountType === "percentage"
      ? (discountValue / 100) * subtotal
      : Math.min(discountValue, subtotal);

  const finalAmount = subtotal - discountAmount;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto p-4">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg">Apply Discount</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Discount Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Discount Type</Label>
            <RadioGroup
              value={discountType}
              onValueChange={(value) => {
                setDiscountType(value);
                setDiscountValue(0);
              }}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="percentage" id="percentage" />
                <Label htmlFor="percentage" className="text-sm">
                  Percentage
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fixed" id="fixed" />
                <Label htmlFor="fixed" className="text-sm">
                  Fixed Amount
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Discount Value */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {discountType === "percentage" ? "Discount %" : "Discount Amount"}
            </Label>
            <div className="relative">
              <Input
                type="number"
                step={discountType === "percentage" ? "0.1" : "0.01"}
                min="0"
                max={
                  discountType === "percentage"
                    ? maxDiscountPercentage
                    : subtotal
                }
                placeholder={discountType === "percentage" ? "0.0" : "0.00"}
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                className="h-9 pl-8 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
              />
              <div className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                {discountType === "percentage" ? (
                  <Percent className="h-4 w-4" />
                ) : (
                  <DollarSign className="h-4 w-4" />
                )}
              </div>
            </div>
          </div>

          {/* Preview */}
          {discountValue > 0 && (
            <div className="p-3 bg-muted rounded-lg space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Original:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-destructive">
                <span>Discount:</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span className="text-primary">${finalAmount.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={discountValue <= 0}
              className="flex-1"
            >
              Apply
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
