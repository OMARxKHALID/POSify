"use client";

import {
  CreditCard,
  Banknote,
  Smartphone,
  User,
  MapPin,
  Clock,
  Receipt,
  Download,
} from "lucide-react";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "card", label: "Card", icon: CreditCard },
  { value: "wallet", label: "Digital Wallet", icon: Smartphone },
  { value: "other", label: "Other", icon: CreditCard },
];

const DELIVERY_TYPES = [
  { value: "dine-in", label: "Dine In", icon: MapPin },
  { value: "takeaway", label: "Takeaway", icon: Clock },
  { value: "delivery", label: "Delivery", icon: MapPin },
];

const TIP_PERCENTAGES = [0, 10, 15, 20, 25];

export function PaymentModal({ isOpen, onClose }) {
  const mockTotals = {
    subtotal: 120,
    discount: 10,
    tax: 5,
    total: 115,
  };

  const mockFinalTotal = 125;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl mx-auto max-h-[90vh] flex flex-col p-4">
        <DialogHeader className="flex-shrink-0 pb-2">
          <DialogTitle className="text-lg">Complete Order</DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
            {/* Left Column */}
            <div className="space-y-4 overflow-y-auto pr-1">
              {/* Customer Info */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <User className="h-4 w-4" />
                    Customer Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Customer Name *</Label>
                    <Input
                      placeholder="Enter customer name"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Mobile Number</Label>
                    <Input
                      placeholder="Enter mobile number"
                      className="h-8 text-sm"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <CreditCard className="h-4 w-4" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <Label className="text-xs">Method</Label>
                  <Select>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Select" />
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
                </CardContent>
              </Card>

              {/* Service Type */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <MapPin className="h-4 w-4" />
                    Service Type
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <Label className="text-xs">Type</Label>
                  <Select>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {DELIVERY_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-4 overflow-y-auto pr-1">
              {/* Order Summary */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <Receipt className="h-4 w-4" />
                    Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>$120.00</span>
                  </div>
                  <div className="flex justify-between text-destructive">
                    <span>Discount:</span>
                    <span>-$10.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>$5.00</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>$115.00</span>
                  </div>
                </CardContent>
              </Card>

              {/* Tip */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <Banknote className="h-4 w-4" />
                    Tip
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-5 gap-1">
                    {TIP_PERCENTAGES.map((percentage) => (
                      <Button
                        key={percentage}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                      >
                        {percentage}%
                      </Button>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Tip Amount:</span>
                    <span className="text-primary">$10.00</span>
                  </div>
                </CardContent>
              </Card>

              {/* Receipt Option */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <Download className="h-4 w-4" />
                    Receipt
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between text-xs">
                  <Label>Download receipt</Label>
                  <Switch className="scale-90" />
                </CardContent>
              </Card>

              {/* Final Total */}
              <Card className="border-primary">
                <CardContent className="p-2">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span>Final Total:</span>
                    <span className="text-primary">${mockFinalTotal}.00</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="button" size="sm" className="flex-1">
              <CreditCard className="h-4 w-4 mr-1" />
              Complete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
