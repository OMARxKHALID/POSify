/**
 * Receipt Generator Component
 * Component for generating and displaying receipts
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format-utils";

export function ReceiptGenerator({ open, orderData, totals, onPrinted }) {
  if (!open || !orderData) return null;

  const handlePrint = () => {
    window.print();
    onPrinted?.();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="text-center">Receipt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <h3 className="font-semibold">Order #{orderData.orderNumber}</h3>
            <p className="text-sm text-muted-foreground">
              {new Date(orderData.createdAt).toLocaleString()}
            </p>
          </div>

          <div className="space-y-2">
            {orderData.items?.map((item, index) => (
              <div key={index} className="flex justify-between">
                <span>
                  {item.name} x{item.quantity}
                </span>
                <span>{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="border-t pt-2 space-y-1">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>
                {formatCurrency(totals?.subtotal || orderData.subtotal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>
                {formatCurrency(totals?.tax || orderData.taxAmount || 0)}
              </span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total:</span>
              <span>{formatCurrency(totals?.total || orderData.total)}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handlePrint} className="flex-1">
              Print Receipt
            </Button>
            <Button variant="outline" onClick={onPrinted} className="flex-1">
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
