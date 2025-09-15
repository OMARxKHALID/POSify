/**
 * Settings Form Actions Component
 * Reusable component for settings form actions
 */

import { Card, CardContent } from "@/components/ui/card";
import { FormActions } from "@/components/form/form-actions";
import { Save, RefreshCw } from "lucide-react";

export function SettingsFormActions({
  onCancel,
  onSubmit,
  isLoading = false,
  hasChanges = false,
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <FormActions
          onCancel={onCancel}
          onSubmit={onSubmit}
          submitText="Save Settings"
          cancelText="Reset"
          isLoading={isLoading}
          submitIcon={Save}
          cancelIcon={RefreshCw}
          disabled={!hasChanges}
        />
      </CardContent>
    </Card>
  );
}
