"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { settingsSchema } from "@/schemas/settings-schema";
import {
  Settings,
  Receipt,
  DollarSign,
  Building2,
  CreditCard,
  Save,
  RefreshCw,
  AlertTriangle,
  Plus,
  Trash2,
} from "lucide-react";

import { Form } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { PageLayout } from "@/components/dashboard/page-layout";
import { PageHeader } from "@/components/dashboard/page-header";
import { FormField } from "@/components/form/form-field";
import { useSettingsManagement, useUpdateSettings } from "@/hooks/use-settings";
import { BusinessSettingsSection } from "@/components/settings/business-settings-section";
import { TaxSettingsSection } from "@/components/settings/tax-settings-section";
import {
  ORDER_STATUS_OPTIONS,
  CURRENCY_OPTIONS,
  RECEIPT_TEMPLATE_OPTIONS,
  TAX_TYPE_OPTIONS,
  SERVICE_CHARGE_APPLY_ON_OPTIONS,
} from "@/constants";

// Default form values aligned with model/schema
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
  const {
    data: settingsData,
    isLoading,
    error,
    updateSettings,
  } = useSettingsManagement();

  // Independent mutations per section to avoid global loading side-effects
  const generalMutation = useUpdateSettings();
  const taxesMutation = useUpdateSettings();
  const receiptMutation = useUpdateSettings();
  const businessMutation = useUpdateSettings();

  const form = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: defaultFormValues,
    mode: "onChange",
  });

  // Hydrate form when data arrives
  useEffect(() => {
    if (settingsData) {
      form.reset(settingsData);
    }
  }, [settingsData, form]);

  // Helper: clean payload before sending (filter incomplete taxes)
  const cleanSettingsPayload = (values) => {
    const cleaned = { ...values };
    if (Array.isArray(cleaned.taxes)) {
      cleaned.taxes = cleaned.taxes.filter((t) =>
        t && typeof t.name === "string" && t.name.trim().length > 0
      );
    }
    return cleaned;
  };

  // Save All
  const onSubmit = async (data) => {
    try {
      const payload = cleanSettingsPayload(data);
      await updateSettings.mutateAsync(payload);
    } catch (_) {
      // handled by hook notifications
    }
  };

  // Reset All
  const handleResetAll = () => {
    if (settingsData) form.reset(settingsData);
  };

  // Section helpers
  const saveGeneralSection = async () => {
    const values = form.getValues();
    const payload = {
      operational: { orderManagement: { ...values.operational?.orderManagement } },
      currency: values.currency,
    };
    try {
      await generalMutation.mutateAsync(payload);
    } catch (_) {}
  };

  const saveTaxesSection = async () => {
    const values = form.getValues();
    const payload = { taxes: cleanSettingsPayload(values).taxes || [] };
    try {
      await taxesMutation.mutateAsync(payload);
    } catch (_) {}
  };

  const saveReceiptSection = async () => {
    const values = form.getValues();
    const payload = { receipt: values.receipt || {} };
    try {
      await receiptMutation.mutateAsync(payload);
    } catch (_) {}
  };

  const saveBusinessSection = async () => {
    const values = form.getValues();
    const payload = { business: values.business || {} };
    try {
      await businessMutation.mutateAsync(payload);
    } catch (_) {}
  };

  // Taxes array helpers
  const addTax = () => {
    const currentTaxes = form.getValues("taxes") || [];
    const newTax = {
      id: `tax_${Date.now()}`,
      name: "",
      rate: 0,
      enabled: true,
      type: "percentage",
    };
    form.setValue("taxes", [...currentTaxes, newTax], { shouldDirty: true });
  };

  const removeTax = (index) => {
    const currentTaxes = form.getValues("taxes") || [];
    const updatedTaxes = currentTaxes.filter((_, i) => i !== index);
    form.setValue("taxes", updatedTaxes, { shouldDirty: true });
  };

  return (
    <PageLayout
      isLoading={isLoading}
      error={error}
      errorMessage="Failed to load settings. Please try refreshing the page."
    >
      <PageHeader
        title="Settings"
        description="Configure your restaurant settings and preferences"
        icon={Settings}
      />

      {form.formState.isDirty && (
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <div>
            <AlertTitle>Unsaved changes</AlertTitle>
            <AlertDescription>
              You have unsaved changes. Use the "Save Section" button on each card to persist updates.
            </AlertDescription>
          </div>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* General Settings */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        General Settings
                      </CardTitle>
                      <CardDescription>
                        Basic configuration for your restaurant
                      </CardDescription>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={saveGeneralSection}
                      disabled={generalMutation.isPending}
                      className="gap-2"
                    >
                      {generalMutation.isPending ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" /> Save Section
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="operational.orderManagement.defaultStatus"
                      label="Default Order Status"
                      component="select"
                      options={ORDER_STATUS_OPTIONS}
                      disabled={generalMutation.isPending}
                    />
                    <FormField
                      control={form.control}
                      name="currency"
                      label="Currency"
                      component="select"
                      options={CURRENCY_OPTIONS}
                      disabled={generalMutation.isPending}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Tax Configuration */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Tax Configuration
                      </CardTitle>
                      <CardDescription>
                        Configure tax rates and types for your business
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addTax}
                        disabled={taxesMutation.isPending}
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" /> Add Tax
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={saveTaxesSection}
                        disabled={taxesMutation.isPending}
                        className="gap-2"
                      >
                        {taxesMutation.isPending ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" /> Save Section
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <TaxSettingsSection
                    form={form}
                    isDisabled={taxesMutation.isPending}
                    typeOptions={TAX_TYPE_OPTIONS}
                    onAddTax={addTax}
                    onRemoveTax={removeTax}
                  />
                </CardContent>
              </Card>

              {/* Receipt Settings */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5" />
                        Receipt Configuration
                      </CardTitle>
                      <CardDescription>
                        Configure receipt printing and formatting
                      </CardDescription>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={saveReceiptSection}
                      disabled={receiptMutation.isPending}
                      className="gap-2"
                    >
                      {receiptMutation.isPending ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" /> Save Section
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="receipt.template"
                      label="Receipt Template"
                      component="select"
                      options={RECEIPT_TEMPLATE_OPTIONS}
                      disabled={receiptMutation.isPending}
                    />
                    <div></div>
                    <FormField
                      control={form.control}
                      name="receipt.header"
                      label="Receipt Header"
                      placeholder="Optional header text"
                      disabled={receiptMutation.isPending}
                    />
                    <FormField
                      control={form.control}
                      name="receipt.footer"
                      label="Receipt Footer"
                      placeholder="Thank you for your business!"
                      disabled={receiptMutation.isPending}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="receipt.printLogo"
                      label="Print Logo"
                      switchDescription="Include logo on receipts"
                      component="switch"
                      disabled={receiptMutation.isPending}
                    />
                    <FormField
                      control={form.control}
                      name="receipt.showTaxBreakdown"
                      label="Show Tax Breakdown"
                      switchDescription="Display detailed tax information"
                      component="switch"
                      disabled={receiptMutation.isPending}
                    />
                    <FormField
                      control={form.control}
                      name="receipt.showItemDiscounts"
                      label="Show Item Discounts"
                      switchDescription="Display item-level discounts"
                      component="switch"
                      disabled={receiptMutation.isPending}
                    />
                    <FormField
                      control={form.control}
                      name="receipt.showOrderNumber"
                      label="Show Order Number"
                      switchDescription="Display order number on receipt"
                      component="switch"
                      disabled={receiptMutation.isPending}
                    />
                    <FormField
                      control={form.control}
                      name="receipt.showServerName"
                      label="Show Server Name"
                      switchDescription="Display server name on receipt"
                      component="switch"
                      disabled={receiptMutation.isPending}
                    />
                    <FormField
                      control={form.control}
                      name="receipt.autoPrint"
                      label="Auto Print Receipts"
                      switchDescription="Automatically print receipts after payment"
                      component="switch"
                      disabled={receiptMutation.isPending}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Business Settings */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Business Configuration
                      </CardTitle>
                      <CardDescription>
                        Configure service charges and tipping
                      </CardDescription>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={saveBusinessSection}
                      disabled={businessMutation.isPending}
                      className="gap-2"
                    >
                      {businessMutation.isPending ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" /> Save Section
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <BusinessSettingsSection
                    form={form}
                    isDisabled={businessMutation.isPending}
                    serviceChargeOptions={SERVICE_CHARGE_APPLY_ON_OPTIONS}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Settings Help */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Settings Guide
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                  <p>Use "Save Section" on each card to persist changes specific to that section.</p>
                  <p>Your changes are not saved until you click the section's Save button.</p>
                </CardContent>
              </Card>

              {/* Form Actions removed per request: use section-level Save only */}
            </div>
          </div>
        </form>
      </Form>
    </PageLayout>
  );
}

