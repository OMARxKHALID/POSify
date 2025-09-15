/**
 * Tax Settings Section Component
 * Reusable component for tax configuration
 */

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  SettingsFormSection,
  SettingsFormGrid,
  SettingsFormField,
} from "./settings-form-section";
import { TAX_TYPES } from "@/constants";

export function TaxSettingsSection({ form, onUpdate }) {
  // Add new tax
  const addTax = () => {
    const currentTaxes = form.getValues("taxes") || [];
    const newTax = {
      id: `tax_${Date.now()}`,
      name: "",
      rate: 0,
      enabled: true,
      type: "percentage",
    };
    form.setValue("taxes", [...currentTaxes, newTax]);
  };

  // Remove tax
  const removeTax = (index) => {
    const currentTaxes = form.getValues("taxes") || [];
    const updatedTaxes = currentTaxes.filter((_, i) => i !== index);
    form.setValue("taxes", updatedTaxes);
  };

  const taxes = form.watch("taxes") || [];

  return (
    <SettingsFormSection
      title="Tax Configuration"
      description="Configure tax rates and types for your business"
      icon={Plus}
    >
      <div className="flex items-center justify-between mb-4">
        <div />
        <Button
          type="button"
          onClick={addTax}
          size="sm"
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Tax
        </Button>
      </div>

      <div className="space-y-4">
        {taxes.map((tax, index) => (
          <Card key={tax.id || index} className="p-4">
            <SettingsFormGrid>
              <SettingsFormField
                control={form.control}
                name={`taxes.${index}.name`}
                label="Tax Name"
                placeholder="e.g., Sales Tax"
              />

              <SettingsFormField
                control={form.control}
                name={`taxes.${index}.rate`}
                label="Rate (%)"
                type="number"
                placeholder="0"
              />

              <SettingsFormField
                control={form.control}
                name={`taxes.${index}.type`}
                label="Type"
                component="select"
                options={TAX_TYPES.map((type) => ({
                  value: type,
                  label: type.charAt(0).toUpperCase() + type.slice(1),
                }))}
              />

              <div className="flex items-center space-x-2">
                <SettingsFormField
                  control={form.control}
                  name={`taxes.${index}.enabled`}
                  label="Enabled"
                  component="switch"
                />
              </div>

              <div className="flex items-end">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeTax(index)}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </Button>
              </div>
            </SettingsFormGrid>
          </Card>
        ))}

        {taxes.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No taxes configured. Click "Add Tax" to get started.
          </div>
        )}
      </div>
    </SettingsFormSection>
  );
}
