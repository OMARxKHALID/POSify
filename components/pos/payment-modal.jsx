"use client";

import { useState } from "react";
import { CreditCard, Banknote, Smartphone } from "lucide-react";

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

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "card", label: "Card", icon: CreditCard },
  { value: "wallet", label: "Digital Wallet", icon: Smartphone },
];

const TIP_PERCENTAGES = [0, 10, 15, 20, 25];

export function PaymentModal({ isOpen, onClose }) {
  const [paymentMethod, setPaymentMethod] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [tipPercentage, setTipPercentage] = useState(0);

  const mockTotals = {
    subtotal: 120,
    discount: 10,
    tax: 5,
    total: 115,
  };

  const tipAmount = (mockTotals.total * tipPercentage) / 100;
  const finalTotal = mockTotals.total + tipAmount;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto p-4">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg">Complete Order</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Customer Info */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Customer Name</Label>
            <Input
              placeholder="Enter customer name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="h-9"
            />
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
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
                Tip: ${tipAmount.toFixed(2)}
              </p>
            )}
          </div>

          {/* Order Summary */}
          <div className="p-3 bg-muted rounded-lg space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${mockTotals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-destructive">
              <span>Discount:</span>
              <span>-${mockTotals.discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>${mockTotals.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total:</span>
              <span>${mockTotals.total.toFixed(2)}</span>
            </div>
            {tipPercentage > 0 && (
              <>
                <div className="flex justify-between">
                  <span>Tip:</span>
                  <span>${tipAmount.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Final Total:</span>
                  <span className="text-primary">${finalTotal.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

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
            <Button type="button" disabled={!paymentMethod} className="flex-1">
              Complete Order
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
