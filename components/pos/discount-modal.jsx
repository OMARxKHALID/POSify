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
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>Apply Discount</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Item Info */}
          <Card>
            <CardContent className="p-3">
              <p className="text-sm text-muted-foreground">Item:</p>
              <p className="font-medium">{itemName}</p>
            </CardContent>
          </Card>

          {/* Discount Type */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Discount Type</Label>
            <RadioGroup
              value={discountType}
              onValueChange={(value) => {
                setDiscountType(value);
                setDiscountValue(0);
              }}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="percentage" id="percentage" />
                <Label htmlFor="percentage" className="flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  Percentage
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fixed" id="fixed" />
                <Label htmlFor="fixed" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Fixed Amount
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Discount Value */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
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
                className="pl-8 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                {discountType === "percentage" ? (
                  <Percent className="h-4 w-4" />
                ) : (
                  <DollarSign className="h-4 w-4" />
                )}
              </div>
            </div>
          </div>

          {/* Reason (Optional) */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Reason (Optional)</Label>
            <Input placeholder="e.g., Customer complaint, Staff discount..." />
          </div>

          <Separator />

          {/* Calculation Preview */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Original Amount:</span>
                  <span>
                    {currency} {subtotal.toFixed(2)}
                  </span>
                </div>

                {discountValue > 0 && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>Discount:</span>
                      <span className="text-destructive">
                        -{currency} {discountAmount.toFixed(2)}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Final Amount:</span>
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
              type="button"
              disabled={discountValue <= 0}
              className="flex-1"
            >
              <Calculator className="h-4 w-4 mr-2" />
              Apply Discount
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
