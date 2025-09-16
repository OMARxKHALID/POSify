"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard, Banknote, Smartphone, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { paymentFormSchema } from "@/schemas/order-schema";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils/format-utils";
import { PAYMENT_METHODS } from "@/constants/payment-methods";

const TIP_PERCENTAGES = [0, 10, 15, 20, 25];

export function PaymentModal({
  open = false,
  onOpenChange = () => {},
  total = 0,
  onConfirm = () => {},
  isSubmitting = false,
}) {
  const [tipPercentage, setTipPercentage] = useState(0);
  const [error, setError] = useState("");

  const form = useForm({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      customerName: "Guest",
      paymentMethod: "",
      mobileNumber: "",
      deliveryType: "dine-in",
      tableNumber: "",
      tip: 0,
    },
  });

  const tipAmount = (total * tipPercentage) / 100;
  const finalTotal = total + tipAmount;

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      form.reset();
      setTipPercentage(0);
      setError("");
    }
  }, [open, form]);

  const handleConfirmOrder = form.handleSubmit((data) => {
    console.log("💳 [DEBUG] Payment Modal - Starting order confirmation:", {
      ...data,
      total,
      tipPercentage,
      tipAmount,
      finalTotal,
    });

    setError("");

    if (total <= 0) {
      console.log(
        "💳 [DEBUG] Payment Modal - Validation failed: Invalid total amount"
      );
      setError("Order total must be greater than $0");
      return;
    }

    try {
      console.log(
        "💳 [DEBUG] Payment Modal - Calling onConfirm with parameters:",
        {
          customerName: data.customerName,
          paymentMethod: data.paymentMethod,
          mobileNumber: data.mobileNumber,
          deliveryType: data.deliveryType,
          tableNumber: data.tableNumber,
          tip: tipAmount,
        }
      );

      onConfirm(
        data.customerName,
        data.paymentMethod,
        data.mobileNumber,
        data.deliveryType,
        data.tableNumber,
        tipAmount
      );

      console.log("💳 [DEBUG] Payment Modal - Order confirmation successful");
    } catch (error) {
      console.error(
        "💳 [DEBUG] Payment Modal - Order confirmation failed:",
        error
      );
      setError("Failed to place order. Please try again.");
      toast.error("Failed to place order");
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto p-4">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg">Complete Order</DialogTitle>
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

          {/* Customer Info */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Customer Name</Label>
            <Input
              placeholder="Enter customer name"
              {...form.register("customerName")}
              className="h-9"
            />
            {form.formState.errors.customerName && (
              <p className="text-xs text-red-600">
                {form.formState.errors.customerName.message}
              </p>
            )}
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Payment Method</Label>
            <Select
              value={form.watch("paymentMethod")}
              onValueChange={(value) => form.setValue("paymentMethod", value)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    <div className="flex items-center gap-2">
                      <method.icon className="h-4 w-4" />
                      {method.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.paymentMethod && (
              <p className="text-xs text-red-600">
                {form.formState.errors.paymentMethod.message}
              </p>
            )}
          </div>

          {/* Tip */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Tip</Label>
            <div className="grid grid-cols-5 gap-1">
              {TIP_PERCENTAGES.map((percentage) => (
                <Button
                  key={percentage}
                  type="button"
                  variant={tipPercentage === percentage ? "default" : "outline"}
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setTipPercentage(percentage)}
                >
                  {percentage}%
                </Button>
              ))}
            </div>
            {tipPercentage > 0 && (
              <p className="text-xs text-muted-foreground">
                Tip: {formatCurrency(tipAmount)}
              </p>
            )}
          </div>

          {/* Order Summary */}
          <div className="p-3 bg-muted rounded-lg space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Total:</span>
              <span>{formatCurrency(total)}</span>
            </div>
            {tipPercentage > 0 && (
              <>
                <div className="flex justify-between">
                  <span>Tip:</span>
                  <span>{formatCurrency(tipAmount)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Final Total:</span>
                  <span className="text-primary">
                    {formatCurrency(finalTotal)}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!form.watch("paymentMethod") || isSubmitting}
              onClick={handleConfirmOrder}
              className="flex-1"
            >
              {isSubmitting ? "Processing..." : "Complete Order"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
