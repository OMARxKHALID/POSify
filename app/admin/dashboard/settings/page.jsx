"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { settingsSchema } from "@/schemas/settings-schema";
import { AlertTriangle } from "lucide-react";
import { Settings, Receipt } from "lucide-react";
import { Form } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PageLayout } from "@/components/dashboard/page-layout";
import { PageHeader } from "@/components/dashboard/page-header";
import { useSettingsManagement } from "@/hooks/use-settings";
import {
  ORDER_STATUSES,
  CURRENCIES,
  RECEIPT_TEMPLATES,
  TIMEZONES,
  LANGUAGES,
} from "@/constants";

// Import reusable components
import {
  SettingsFormSection,
  SettingsFormGrid,
  SettingsFormField,
} from "@/components/settings/settings-form-section";
import { TaxSettingsSection } from "@/components/settings/tax-settings-section";
import { BusinessSettingsSection } from "@/components/settings/business-settings-section";
import { SettingsFormActions } from "@/components/settings/settings-form-actions";

// Helper function to create select options
const createSelectOptions = (
  items,
  transform = (item) => ({
    value: item,
    label:
      typeof item === "string"
        ? item.charAt(0).toUpperCase() + item.slice(1)
        : item,
  })
) => items.map(transform);

// Default form values - only essential settings
const defaultFormValues = {
  taxes: [],
  receipt: {
    template: "default",
    footer: "Thank you for your business!",
    header: "",
    printLogo: true,
    showTaxBreakdown: true,
    showItemDiscounts: true,
    showOrderNumber: true,
    showServerName: true,
    autoPrint: false,
  },
  operational: {
    orderManagement: {
      defaultStatus: "pending",
    },
  },
  business: {
    serviceCharge: {
      enabled: false,
      percentage: 0,
      applyOn: "subtotal",
    },
    tipping: {
      enabled: true,
      suggestedPercentages: [10, 15, 20],
      allowCustomTip: true,
    },
  },
  currency: "USD",
};

export default function SettingsPage() {
  const [originalData, setOriginalData] = useState(null);

  const {
    data: settingsData,
    isLoading: isLoadingSettings,
    error: settingsError,
    updateSettings,
  } = useSettingsManagement();

  const settings = settingsData || null;

  // Initialize form with default values
  const form = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: defaultFormValues,
  });

  // Update form when settings data loads
  useEffect(() => {
    if (settings) {
      form.reset(settings);
      setOriginalData(settings);
    }
  }, [settings, form]);

  const { isDirty } = form.formState;

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      await updateSettings.mutateAsync(data);
      setOriginalData(data);
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  // Handle form reset
  const handleReset = () => {
    form.reset(originalData);
  };

  return (
    <PageLayout
      isLoading={isLoadingSettings}
      error={settingsError}
      errorMessage="Failed to load settings. Please try refreshing the page."
    >
      <PageHeader
        title="Settings"
        description="Configure your restaurant settings and preferences"
        icon={Settings}
      />

      {/* Changes Alert */}
      {isDirty && (
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have unsaved changes. Don't forget to save your settings.
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* General Settings */}
          <SettingsFormSection
            title="General Settings"
            description="Basic configuration for your restaurant"
          >
            <SettingsFormGrid>
              <SettingsFormField
                control={form.control}
                name="operational.orderManagement.defaultStatus"
                label="Default Order Status"
                component="select"
                options={createSelectOptions(ORDER_STATUSES)}
              />
              <SettingsFormField
                control={form.control}
                name="currency"
                label="Currency"
                component="select"
                options={createSelectOptions(CURRENCIES)}
              />
              <SettingsFormField
                control={form.control}
                name="timezone"
                label="Timezone"
                component="select"
                options={createSelectOptions(TIMEZONES)}
              />
              <SettingsFormField
                control={form.control}
                name="language"
                label="Language"
                component="select"
                options={createSelectOptions(LANGUAGES)}
              />
            </SettingsFormGrid>
          </SettingsFormSection>

          {/* Tax Settings */}
          <TaxSettingsSection form={form} />

          {/* Receipt Settings */}
          <SettingsFormSection
            title="Receipt Configuration"
            description="Configure receipt printing and formatting"
          >
            <SettingsFormGrid>
              <SettingsFormField
                control={form.control}
                name="receipt.template"
                label="Receipt Template"
                component="select"
                options={createSelectOptions(RECEIPT_TEMPLATES)}
              />
              <SettingsFormField
                control={form.control}
                name="receipt.footer"
                label="Receipt Footer"
                placeholder="Thank you for your business!"
              />
              <SettingsFormField
                control={form.control}
                name="receipt.header"
                label="Receipt Header"
                placeholder="Optional header text"
              />
              <SettingsFormField
                control={form.control}
                name="receipt.printLogo"
                label="Print Logo"
                switchDescription="Include logo on receipts"
                component="switch"
              />
              <SettingsFormField
                control={form.control}
                name="receipt.showTaxBreakdown"
                label="Show Tax Breakdown"
                switchDescription="Display detailed tax information"
                component="switch"
              />
              <SettingsFormField
                control={form.control}
                name="receipt.showItemDiscounts"
                label="Show Item Discounts"
                switchDescription="Display item-level discounts"
                component="switch"
              />
              <SettingsFormField
                control={form.control}
                name="receipt.showOrderNumber"
                label="Show Order Number"
                switchDescription="Display order number on receipt"
                component="switch"
              />
              <SettingsFormField
                control={form.control}
                name="receipt.showServerName"
                label="Show Server Name"
                switchDescription="Display server name on receipt"
                component="switch"
              />
              <SettingsFormField
                control={form.control}
                name="receipt.autoPrint"
                label="Auto Print Receipts"
                switchDescription="Automatically print receipts after payment"
                component="switch"
              />
            </SettingsFormGrid>
          </SettingsFormSection>

          {/* Business Settings */}
          <BusinessSettingsSection form={form} />

          {/* Form Actions */}
          <SettingsFormActions
            onCancel={handleReset}
            isLoading={updateSettings.isPending}
            hasChanges={isDirty}
          />
        </form>
      </Form>
    </PageLayout>
  );
}
