/**
 * Business Settings Section
 * Renders service charge and tipping fields using the shared FormField API.
 * Note: This component intentionally does NOT render its own Card wrapper so it can be embedded
 * inside different layouts while keeping actions (like Save Section) in the parent.
 */

import { SettingsFormGrid, SettingsFormField } from "./settings-form-section";

export function BusinessSettingsSection({ form, isDisabled = false, serviceChargeOptions = [], }) {
  return (
    <div className="space-y-6">
      {/* Service Charge */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Service Charge</h4>
        <SettingsFormGrid className="md:grid-cols-3">
          <SettingsFormField
            control={form.control}
            name="business.serviceCharge.enabled"
            label="Enable Service Charge"
            component="switch"
            disabled={isDisabled}
          />

          <SettingsFormField
            control={form.control}
            name="business.serviceCharge.percentage"
            label="Service Charge (%)"
            type="number"
            placeholder="0"
            disabled={isDisabled}
            description="Enter a value from 0 to 100."
          />

          <SettingsFormField
            control={form.control}
            name="business.serviceCharge.applyOn"
            label="Apply On"
            component="select"
            options={serviceChargeOptions}
            disabled={isDisabled}
          />
        </SettingsFormGrid>
      </div>

      {/* Tipping */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Tipping</h4>
        <SettingsFormGrid>
          <SettingsFormField
            control={form.control}
            name="business.tipping.enabled"
            label="Enable Tipping"
            component="switch"
            disabled={isDisabled}
          />

          <SettingsFormField
            control={form.control}
            name="business.tipping.allowCustomTip"
            label="Allow Custom Tips"
            component="switch"
            disabled={isDisabled}
          />
        </SettingsFormGrid>
      </div>
    </div>
  );
}

