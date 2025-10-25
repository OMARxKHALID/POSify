/**
 * Tax Settings Section (Section-only)
 * Compact list UI without internal Card wrapper; parent controls header/actions.
 */

import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { SettingsFormField } from "./settings-form-section";

export function TaxSettingsSection({
  form,
  isDisabled = false,
  typeOptions = [],
  onAddTax,
  onRemoveTax,
}) {
  const taxes = form.watch("taxes") || [];

  const handleInlineAdd = () => {
    const next = [
      ...taxes,
      { id: `tax_${Date.now()}`, name: "", rate: 0, enabled: true, type: "percentage" },
    ];
    form.setValue("taxes", next, { shouldDirty: true });
  };

  const handleRemove = (index) => {
    if (onRemoveTax) return onRemoveTax(index);
    const next = (form.getValues("taxes") || []).filter((_, i) => i !== index);
    form.setValue("taxes", next, { shouldDirty: true });
  };

  return (
    <div className="space-y-3">
      {!onAddTax ? (
        <div className="flex items-center justify-end">
          <Button
            type="button"
            size="sm"
            onClick={handleInlineAdd}
            disabled={isDisabled}
            className="gap-2"
          >
            <Plus className="h-4 w-4" /> Add Tax
          </Button>
        </div>
      ) : null}

      {taxes.length > 0 ? (
        <div className="rounded-lg border overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-3 bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
            <div className="md:col-span-5">Tax Name</div>
            <div className="md:col-span-2">Rate (%)</div>
            <div className="md:col-span-3">Type</div>
            <div className="md:col-span-2 text-right">Enabled</div>
          </div>
          <div className="divide-y">
            {taxes.map((tax, index) => (
              <div
                key={tax.id || index}
                className="grid grid-cols-1 md:grid-cols-12 items-center gap-3 px-4 py-3"
              >
                <div className="md:col-span-5">
                  <SettingsFormField
                    control={form.control}
                    name={`taxes.${index}.name`}
                    label=""
                    placeholder="e.g., Sales Tax"
                    disabled={isDisabled}
                  />
                </div>
                <div className="md:col-span-2">
                  <SettingsFormField
                    control={form.control}
                    name={`taxes.${index}.rate`}
                    label=""
                    type="number"
                    placeholder="0"
                    disabled={isDisabled}
                    description="0-100"
                  />
                </div>
                <div className="md:col-span-3">
                  <SettingsFormField
                    control={form.control}
                    name={`taxes.${index}.type`}
                    label=""
                    component="select"
                    options={typeOptions}
                    disabled={isDisabled}
                  />
                </div>
                <div className="md:col-span-2 flex items-center justify-end gap-2">
                  <SettingsFormField
                    control={form.control}
                    name={`taxes.${index}.enabled`}
                    label=""
                    component="switch"
                    disabled={isDisabled}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemove(index)}
                    disabled={isDisabled}
                    aria-label="Remove tax"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-center">
          <div className="text-sm text-muted-foreground mb-3">No taxes configured yet.</div>
          <Button
            type="button"
            size="sm"
            onClick={onAddTax || handleInlineAdd}
            disabled={isDisabled}
            className="gap-2"
          >
            <Plus className="h-4 w-4" /> Add your first tax
          </Button>
        </div>
      )}
    </div>
  );
}
