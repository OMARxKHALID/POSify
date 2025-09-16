"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Percent, DollarSign, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { discountFormSchema } from "@/schemas/order-schema";

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
import { useCartStore } from "@/lib/store/use-cart-store";
import { formatCurrency } from "@/lib/utils/format-utils";

export function DiscountModal({ open = false, onClose = () => {} }) {
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState("");

  const form = useForm({
    resolver: zodResolver(discountFormSchema),
    defaultValues: {
      discountType: "percentage",
      discountValue: 0,
    },
  });

  const { orderItems, applyCartDiscount, cartDiscount, removeCartDiscount } =
    useCartStore();

  // Calculate actual subtotal from cart items
  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const maxDiscountPercentage = 50;

  const discountType = form.watch("discountType");
  const discountValue = form.watch("discountValue");

  const discountAmount =
    discountType === "percentage"
      ? (discountValue / 100) * subtotal
      : Math.min(discountValue, subtotal);

  const finalAmount = subtotal - discountAmount;

  const handleApplyDiscount = form.handleSubmit(async (data) => {
    setError("");

    if (subtotal <= 0) {
      setError("No items in cart to apply discount to");
      return;
    }

    setIsApplying(true);

    try {
      if (data.discountType === "percentage") {
        // Validate percentage
        if (data.discountValue > maxDiscountPercentage) {
          setError(`Maximum discount allowed is ${maxDiscountPercentage}%`);
          setIsApplying(false);
          return;
        }
        applyCartDiscount(data.discountValue);
        toast.success(`${data.discountValue}% discount applied`);
      } else {
        // Validate fixed amount
        if (data.discountValue > subtotal) {
          setError("Discount amount cannot exceed subtotal");
          setIsApplying(false);
          return;
        }
        // Convert fixed amount to percentage
        const percentage = (data.discountValue / subtotal) * 100;
        applyCartDiscount(percentage);
        toast.success(`${formatCurrency(data.discountValue)} discount applied`);
      }

      // Reset form and close
      form.reset();
      setError("");
      onClose();
    } catch (error) {
      console.error("Failed to apply discount:", error);
      setError("Failed to apply discount. Please try again.");
    } finally {
      setIsApplying(false);
    }
  });

  const handleRemoveDiscount = () => {
    removeCartDiscount();
    form.reset();
    setError("");
    toast.success("Discount removed");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto p-4">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg">Apply Discount</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2 text-red-800 text-sm">
                <AlertTriangle className="h-4 w-4" />
                {error}
              </div>
            </div>
          )}

          {/* Current Applied Discount */}
          {cartDiscount > 0 && (
            <div className="bg-muted border rounded-md p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Current Discount Applied
                </span>
                <span className="text-sm font-semibold text-primary">
                  {cartDiscount}%
                </span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Discount Amount:</span>
                <span>-{formatCurrency((cartDiscount / 100) * subtotal)}</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemoveDiscount}
                className="w-full h-8 text-xs"
              >
                Remove Discount
              </Button>
            </div>
          )}

          {/* Discount Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Discount Type</Label>
            <RadioGroup
              value={discountType}
              onValueChange={(value) => {
                form.setValue("discountType", value);
                form.setValue("discountValue", 0);
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
            {form.formState.errors.discountType && (
              <p className="text-xs text-red-600">
                {form.formState.errors.discountType.message}
              </p>
            )}
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
                {...form.register("discountValue", { valueAsNumber: true })}
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
            {form.formState.errors.discountValue && (
              <p className="text-xs text-red-600">
                {form.formState.errors.discountValue.message}
              </p>
            )}
          </div>

          {/* Preview */}
          {discountValue > 0 && (
            <div className="p-3 bg-muted rounded-lg space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Original:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-destructive">
                <span>Discount:</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span className="text-primary">
                  {formatCurrency(finalAmount)}
                </span>
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
              disabled={discountValue <= 0 || isApplying}
              onClick={handleApplyDiscount}
              className="flex-1"
            >
              {isApplying ? "Applying..." : "Apply"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
