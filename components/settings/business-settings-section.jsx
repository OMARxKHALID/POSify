/**
 * Business Settings Section Component
 * Reusable component for business configuration
 */

import { Separator } from "@/components/ui/separator";
import {
  SettingsFormSection,
  SettingsFormGrid,
  SettingsFormField,
} from "./settings-form-section";
import { SERVICE_CHARGE_APPLY_ON } from "@/constants";

export function BusinessSettingsSection({ form }) {
  return (
    <SettingsFormSection
      title="Business Configuration"
      description="Configure service charges, tipping, and discount rules"
      icon={null}
    >
      {/* Service Charge */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Service Charge</h4>
        <SettingsFormGrid>
          <SettingsFormField
            control={form.control}
            name="business.serviceCharge.enabled"
            label="Enable Service Charge"
            component="switch"
          />

          <SettingsFormField
            control={form.control}
            name="business.serviceCharge.percentage"
            label="Service Charge (%)"
            type="number"
            placeholder="0"
          />

          <SettingsFormField
            control={form.control}
            name="business.serviceCharge.applyOn"
            label="Apply On"
            component="select"
            options={SERVICE_CHARGE_APPLY_ON.map((option) => ({
              value: option,
              label: option.charAt(0).toUpperCase() + option.slice(1),
            }))}
          />
        </SettingsFormGrid>
      </div>

      <Separator />

      {/* Tipping */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Tipping</h4>
        <SettingsFormGrid>
          <SettingsFormField
            control={form.control}
            name="business.tipping.enabled"
            label="Enable Tipping"
            component="switch"
          />

          <SettingsFormField
            control={form.control}
            name="business.tipping.allowCustomTip"
            label="Allow Custom Tips"
            component="switch"
          />
        </SettingsFormGrid>
      </div>

      <Separator />

      {/* Discount Rules */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Discount Rules</h4>
        <SettingsFormGrid>
          <SettingsFormField
            control={form.control}
            name="business.discountRules.maxDiscountPercentage"
            label="Max Discount (%)"
            type="number"
            placeholder="50"
          />

          <SettingsFormField
            control={form.control}
            name="business.discountRules.managerApprovalThreshold"
            label="Manager Approval Threshold ($)"
            type="number"
            placeholder="100"
          />

          <SettingsFormField
            control={form.control}
            name="business.discountRules.staffDiscountPermission"
            label="Staff Discount Permission"
            component="switch"
          />

          <SettingsFormField
            control={form.control}
            name="business.discountRules.requireManagerApproval"
            label="Require Manager Approval"
            component="switch"
          />
        </SettingsFormGrid>
      </div>
    </SettingsFormSection>
  );
}
