"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getTaxBreakdown } from "@/lib/utils/business-utils";
import { formatCurrency } from "@/lib/utils/format-utils";

const Row = ({ label, value, className = "" }) => (
  <div className={`flex justify-between ${className}`}>
    <span>{label}</span>
    <span>{value}</span>
  </div>
);

export function CartFooter({
  totals,
  cartDiscount,
  onDiscountModalOpen,
  onPaymentModalOpen,
  onRemoveCartDiscount,
  currency,
  settings,
}) {
  const subtotalAfterDiscounts =
    totals.subtotal - totals.itemDiscounts - totals.discount;
  const taxBreakdown = getTaxBreakdown(subtotalAfterDiscounts, settings?.taxes);

  const handleRemoveDiscount = () => {
    onRemoveCartDiscount();
    toast.success("Discount removed from cart");
  };

  return (
    <div className="border-t bg-card p-3 space-y-3 flex-shrink-0">
      <div className="space-y-2 text-sm">
        <Row
          label="Subtotal:"
          value={formatCurrency(totals.subtotal, currency)}
        />
        {totals.itemDiscounts > 0 && (
          <Row
            label="Item Discounts:"
            value={`-${formatCurrency(totals.itemDiscounts, currency)}`}
            className="text-green-600"
          />
        )}
        {cartDiscount > 0 && (
          <Row
            label={`Cart Discount (${cartDiscount}%):`}
            value={`-${formatCurrency(totals.discount, currency)}`}
            className="text-green-600"
          />
        )}
        {taxBreakdown.map((tax, i) => (
          <Row
            key={i}
            label={`${tax.name} (${tax.rate}${
              tax.type === "percentage" ? "%" : ""
            }):`}
            value={formatCurrency(tax.amount, currency)}
          />
        ))}
        <Separator />
        <Row
          label="Total:"
          value={formatCurrency(totals.total, currency)}
          className="text-base font-semibold"
        />
      </div>

      <div className="space-y-2">
        {cartDiscount > 0 ? (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onDiscountModalOpen}
                className="flex-1"
              >
                Modify Discount
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemoveDiscount}
                className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
              >
                Remove
              </Button>
            </div>
            <div className="text-xs text-center text-green-600 font-medium">
              {cartDiscount}% discount applied
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={onDiscountModalOpen}
            className="w-full"
          >
            Apply Discount
          </Button>
        )}
        <Button onClick={onPaymentModalOpen} className="w-full" size="sm">
          Proceed to Payment
        </Button>
      </div>
    </div>
  );
}
