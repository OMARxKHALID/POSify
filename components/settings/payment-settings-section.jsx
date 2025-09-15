/**
 * Payment Settings Section Component
 * Reusable component for payment configuration
 */

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  SettingsFormSection,
  SettingsFormGrid,
  SettingsFormField,
} from "./settings-form-section";
import { PAYMENT_METHODS } from "@/constants";

export function PaymentSettingsSection({ form }) {
  return (
    <SettingsFormSection
      title="Payment Configuration"
      description="Configure payment methods and cash handling"
      icon={null}
    >
      <SettingsFormGrid>
        <SettingsFormField
          control={form.control}
          name="payment.defaultMethod"
          label="Default Payment Method"
          component="select"
          options={PAYMENT_METHODS.map((method) => ({
            value: method,
            label: method.charAt(0).toUpperCase() + method.slice(1),
          }))}
        />

        <div className="space-y-2">
          <Label>Preferred Payment Methods</Label>
          <div className="space-y-2">
            {PAYMENT_METHODS.map((method) => (
              <div key={method} className="flex items-center space-x-2">
                <Switch
                  checked={form
                    .watch("payment.preferredMethods")
                    ?.includes(method)}
                  onCheckedChange={(checked) => {
                    const current =
                      form.getValues("payment.preferredMethods") || [];
                    if (checked) {
                      form.setValue("payment.preferredMethods", [
                        ...current,
                        method,
                      ]);
                    } else {
                      form.setValue(
                        "payment.preferredMethods",
                        current.filter((m) => m !== method)
                      );
                    }
                  }}
                />
                <Label className="capitalize">{method}</Label>
              </div>
            ))}
          </div>
        </div>

        <SettingsFormField
          control={form.control}
          name="payment.cashHandling.enableCashDrawer"
          label="Enable Cash Drawer"
          switchDescription="Automatically open cash drawer for cash payments"
          component="switch"
        />

        <SettingsFormField
          control={form.control}
          name="payment.cashHandling.requireExactChange"
          label="Require Exact Change"
          switchDescription="Force exact cash amounts only"
          component="switch"
        />
      </SettingsFormGrid>
    </SettingsFormSection>
  );
}
