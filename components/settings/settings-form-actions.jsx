/**
 * Settings Form Actions
 * Reusable actions block to place Save/Reset buttons.
 * Note: Keep actions minimal to align with page-level behaviors.
 */

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, RefreshCw } from "lucide-react";

export function SettingsFormActions({
  onReset,
  onSubmit,
  isSubmitting = false,
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            disabled={isSubmitting}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" /> Reset Changes
          </Button>
          <Button type="button" onClick={onSubmit} disabled={isSubmitting} className="gap-2">
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Saving Settings...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Save Settings
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

