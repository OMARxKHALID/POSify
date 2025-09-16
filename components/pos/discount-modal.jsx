"use client";

import { useState } from "react";
import { Percent, DollarSign, Calculator } from "lucide-react";

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
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function DiscountModal({ open = true, onClose = () => {} }) {
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState(0);

  // Mock subtotal and item
  const subtotal = 50.0;
  const itemName = "Classic Burger";
  const currency = "USD";
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
          {/* Item Info */}
          <Card>
            <CardContent className="p-2">
              <p className="text-xs text-muted-foreground">Item:</p>
              <p className="text-sm font-medium">{itemName}</p>
            </CardContent>
          </Card>

          {/* Discount Type */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Discount Type</Label>
            <RadioGroup
              value={discountType}
              onValueChange={(value) => {
                setDiscountType(value);
                setDiscountValue(0);
              }}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="percentage" id="percentage" />
                <Label
                  htmlFor="percentage"
                  className="flex items-center gap-1 text-xs"
                >
                  <Percent className="h-3 w-3" />%
                </Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="fixed" id="fixed" />
                <Label
                  htmlFor="fixed"
                  className="flex items-center gap-1 text-xs"
                >
                  <DollarSign className="h-3 w-3" />
                  Fixed
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Discount Value */}
          <div className="space-y-1">
            <Label className="text-xs font-medium">
              {discountType === "percentage"
                ? "Discount Percentage"
                : "Discount Amount"}
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
                className="h-8 pl-7 text-sm [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
              />
              <div className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                {discountType === "percentage" ? (
                  <Percent className="h-3 w-3" />
                ) : (
                  <DollarSign className="h-3 w-3" />
                )}
              </div>
            </div>
          </div>

          {/* Reason (Optional) */}
          <div className="space-y-1">
            <Label className="text-xs font-medium">Reason (Optional)</Label>
            <Input
              placeholder="e.g., Customer complaint, Staff discount..."
              className="h-8 text-sm"
            />
          </div>

          <Separator />

          {/* Calculation Preview */}
          <Card>
            <CardContent className="p-2">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Original:</span>
                  <span>
                    {currency} {subtotal.toFixed(2)}
                  </span>
                </div>

                {discountValue > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span>Discount:</span>
                      <span className="text-destructive">
                        -{currency} {discountAmount.toFixed(2)}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-sm">
                      <span>Final:</span>
                      <span className="text-primary">
                        {currency} {finalAmount.toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

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
              type="button"
              disabled={discountValue <= 0}
              size="sm"
              className="flex-1"
            >
              <Calculator className="h-3 w-3 mr-1" />
              Apply
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
