"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { settingsSchema } from "@/schemas/settings-schema";
import {
  Settings,
  DollarSign,
  CreditCard,
  Receipt,
  Users,
  Globe,
  AlertTriangle,
} from "lucide-react";

import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PageLayout } from "@/components/dashboard/page-layout";
import { PageHeader } from "@/components/dashboard/page-header";
import { useSettingsManagement } from "@/hooks/use-settings";
import {
  ORDER_STATUSES,
  CURRENCIES,
  TIMEZONES,
  LANGUAGES,
  DATE_FORMATS,
  TIME_FORMATS,
} from "@/constants";

// Import reusable components
import {
  SettingsFormSection,
  SettingsFormGrid,
  SettingsFormField,
} from "@/components/settings/settings-form-section";
import { TaxSettingsSection } from "@/components/settings/tax-settings-section";
import { PaymentSettingsSection } from "@/components/settings/payment-settings-section";
import { BusinessSettingsSection } from "@/components/settings/business-settings-section";
import { SettingsFormActions } from "@/components/settings/settings-form-actions";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState(null);

  const {
    data: settingsData,
    isLoading: isLoadingSettings,
    error: settingsError,
    updateSettings,
  } = useSettingsManagement();

  const settings = settingsData?.data?.settings;

  // Initialize form with default values
  const form = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      taxes: [],
      payment: {
        defaultMethod: "cash",
        preferredMethods: ["cash", "card", "wallet"],
        cashHandling: {
          enableCashDrawer: true,
          requireExactChange: false,
        },
      },
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
      customerPreferences: {
        requireCustomerPhone: false,
        requireCustomerName: false,
        allowGuestCheckout: true,
        enableCustomerDatabase: true,
      },
      operational: {
        orderManagement: {
          defaultStatus: "pending",
          orderNumberFormat: "ORD-{seq}",
          autoConfirmOrders: false,
        },
        syncMode: "auto",
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
        discountRules: {
          maxDiscountPercentage: 50,
          staffDiscountPermission: false,
          requireManagerApproval: true,
          managerApprovalThreshold: 100,
        },
      },
      currency: "USD",
      timezone: "UTC",
      language: "en",
      dateFormat: "MM/DD/YYYY",
      timeFormat: "12h",
    },
  });

  // Update form when settings data loads
  useEffect(() => {
    if (settings) {
      form.reset(settings);
      setOriginalData(settings);
    }
  }, [settings, form]);

  // Watch for changes
  const watchedValues = form.watch();

  // Check if there are changes
  useEffect(() => {
    if (originalData) {
      const hasChanges =
        JSON.stringify(watchedValues) !== JSON.stringify(originalData);
      setHasChanges(hasChanges);
    }
  }, [watchedValues, originalData]);

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      await updateSettings.mutateAsync(data);
      setOriginalData(data);
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  // Handle form reset
  const handleReset = () => {
    form.reset(originalData);
    setHasChanges(false);
  };

  return (
    <PageLayout
      isLoading={isLoadingSettings}
      error={settingsError ? settingsError : null}
      errorMessage="Failed to load settings. Please try refreshing the page."
    >
      <PageHeader
        title="Settings"
        description="Configure your restaurant settings and preferences"
        icon={Settings}
      />

      {/* Changes Alert */}
      {hasChanges && (
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have unsaved changes. Don't forget to save your settings.
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="taxes">Taxes</TabsTrigger>
              <TabsTrigger value="payment">Payment</TabsTrigger>
              <TabsTrigger value="receipt">Receipt</TabsTrigger>
              <TabsTrigger value="business">Business</TabsTrigger>
              <TabsTrigger value="localization">Localization</TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general" className="space-y-6">
              <SettingsFormSection
                title="General Settings"
                description="Basic configuration for your restaurant"
                icon={Settings}
              >
                <SettingsFormGrid>
                  <SettingsFormField
                    control={form.control}
                    name="operational.orderManagement.defaultStatus"
                    label="Default Order Status"
                    component="select"
                    options={ORDER_STATUSES.map((status) => ({
                      value: status,
                      label: status.charAt(0).toUpperCase() + status.slice(1),
                    }))}
                  />

                  <SettingsFormField
                    control={form.control}
                    name="operational.orderManagement.orderNumberFormat"
                    label="Order Number Format"
                    placeholder="ORD-{seq}"
                  />

                  <SettingsFormField
                    control={form.control}
                    name="operational.orderManagement.autoConfirmOrders"
                    label="Auto Confirm Orders"
                    switchDescription="Automatically confirm new orders"
                    component="switch"
                  />

                  <SettingsFormField
                    control={form.control}
                    name="operational.syncMode"
                    label="Sync Mode"
                    component="select"
                    options={[
                      { value: "auto", label: "Automatic" },
                      { value: "manual", label: "Manual" },
                    ]}
                  />
                </SettingsFormGrid>
              </SettingsFormSection>

              <SettingsFormSection
                title="Customer Preferences"
                description="Configure customer-related settings"
                icon={Users}
              >
                <SettingsFormGrid>
                  <SettingsFormField
                    control={form.control}
                    name="customerPreferences.requireCustomerPhone"
                    label="Require Customer Phone"
                    switchDescription="Make phone number mandatory"
                    component="switch"
                  />

                  <SettingsFormField
                    control={form.control}
                    name="customerPreferences.requireCustomerName"
                    label="Require Customer Name"
                    switchDescription="Make customer name mandatory"
                    component="switch"
                  />

                  <SettingsFormField
                    control={form.control}
                    name="customerPreferences.allowGuestCheckout"
                    label="Allow Guest Checkout"
                    switchDescription="Allow orders without customer info"
                    component="switch"
                  />

                  <SettingsFormField
                    control={form.control}
                    name="customerPreferences.enableCustomerDatabase"
                    label="Enable Customer Database"
                    switchDescription="Store customer information"
                    component="switch"
                  />
                </SettingsFormGrid>
              </SettingsFormSection>
            </TabsContent>

            {/* Tax Settings */}
            <TabsContent value="taxes" className="space-y-6">
              <TaxSettingsSection form={form} />
            </TabsContent>

            {/* Payment Settings */}
            <TabsContent value="payment" className="space-y-6">
              <PaymentSettingsSection form={form} />
            </TabsContent>

            {/* Receipt Settings */}
            <TabsContent value="receipt" className="space-y-6">
              <SettingsFormSection
                title="Receipt Configuration"
                description="Configure receipt printing and formatting"
                icon={Receipt}
              >
                <SettingsFormGrid>
                  <SettingsFormField
                    control={form.control}
                    name="receipt.template"
                    label="Receipt Template"
                    component="select"
                    options={[
                      { value: "default", label: "Default" },
                      { value: "minimal", label: "Minimal" },
                      { value: "detailed", label: "Detailed" },
                    ]}
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
            </TabsContent>

            {/* Business Settings */}
            <TabsContent value="business" className="space-y-6">
              <BusinessSettingsSection form={form} />
            </TabsContent>

            {/* Localization Settings */}
            <TabsContent value="localization" className="space-y-6">
              <SettingsFormSection
                title="Localization Settings"
                description="Configure currency, timezone, and language preferences"
                icon={Globe}
              >
                <SettingsFormGrid>
                  <SettingsFormField
                    control={form.control}
                    name="currency"
                    label="Currency"
                    component="select"
                    options={CURRENCIES.map((currency) => ({
                      value: currency,
                      label: currency,
                    }))}
                  />

                  <SettingsFormField
                    control={form.control}
                    name="timezone"
                    label="Timezone"
                    component="select"
                    options={TIMEZONES.map((tz) => ({
                      value: tz,
                      label: tz,
                    }))}
                  />

                  <SettingsFormField
                    control={form.control}
                    name="language"
                    label="Language"
                    component="select"
                    options={LANGUAGES.map((lang) => ({
                      value: lang,
                      label: lang.toUpperCase(),
                    }))}
                  />

                  <SettingsFormField
                    control={form.control}
                    name="dateFormat"
                    label="Date Format"
                    component="select"
                    options={DATE_FORMATS.map((format) => ({
                      value: format,
                      label: format,
                    }))}
                  />

                  <SettingsFormField
                    control={form.control}
                    name="timeFormat"
                    label="Time Format"
                    component="select"
                    options={TIME_FORMATS.map((format) => ({
                      value: format,
                      label: format,
                    }))}
                  />
                </SettingsFormGrid>
              </SettingsFormSection>
            </TabsContent>
          </Tabs>

          {/* Form Actions */}
          <SettingsFormActions
            onCancel={handleReset}
            onSubmit={form.handleSubmit(onSubmit)}
            isLoading={updateSettings.isPending}
            hasChanges={hasChanges}
          />
        </form>
      </Form>
    </PageLayout>
  );
}
