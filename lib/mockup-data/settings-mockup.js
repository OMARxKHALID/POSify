/**
 * Mockup data for settings management
 * This file contains sample settings data for development and testing
 */

export const mockSettings = {
  id: "settings_001",
  organizationId: "org_001",

  // Tax configuration
  taxes: [
    {
      id: "tax_001",
      name: "Sales Tax",
      rate: 8.5,
      enabled: true,
      type: "percentage",
    },
    {
      id: "tax_002",
      name: "City Tax",
      rate: 1.0,
      enabled: true,
      type: "percentage",
    },
    {
      id: "tax_003",
      name: "Service Fee",
      rate: 2.5,
      enabled: false,
      type: "fixed",
    },
  ],

  // Payment configuration
  payment: {
    defaultMethod: "card",
    preferredMethods: ["card", "cash", "digital"],
    cashHandling: {
      enableCashDrawer: true,
      requireExactChange: false,
    },
  },

  // Receipt configuration
  receipt: {
    template: "default",
    footer: "Thank you for dining with us! Visit us again soon.",
    header: "Welcome to POSify Restaurant",
    printLogo: true,
    showTaxBreakdown: true,
    showItemDiscounts: true,
    showOrderNumber: true,
    showServerName: true,
    autoPrint: false,
  },

  // Customer preferences
  customerPreferences: {
    requireCustomerPhone: false,
    requireCustomerName: false,
    allowGuestCheckout: true,
    enableCustomerDatabase: true,
  },

  // Operational settings
  operational: {
    orderManagement: {
      defaultStatus: "pending",
      orderNumberFormat: "ORD-{YYYY}-{seq}",
      autoConfirmOrders: false,
    },
    syncMode: "auto",
  },

  // Business configuration
  business: {
    serviceCharge: {
      enabled: true,
      percentage: 5.0,
      applyOn: "subtotal",
    },
    tipping: {
      enabled: true,
      suggestedPercentages: [15, 18, 20, 25],
      allowCustomTip: true,
    },
    discountRules: {
      maxDiscountPercentage: 20,
    },
  },

  // Localization
  currency: "USD",
  timezone: "America/New_York",
  language: "en",
  dateFormat: "MM/DD/YYYY",
  timeFormat: "12h",

  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-15T12:00:00Z",
};

export const mockTaxTypes = [
  { value: "percentage", label: "Percentage (%)" },
  { value: "fixed", label: "Fixed Amount ($)" },
];

export const mockPaymentMethods = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Credit/Debit Card" },
  { value: "digital", label: "Digital Wallet" },
  { value: "check", label: "Check" },
  { value: "gift_card", label: "Gift Card" },
];

export const mockReceiptTemplates = [
  { value: "default", label: "Default Template" },
  { value: "minimal", label: "Minimal Template" },
  { value: "detailed", label: "Detailed Template" },
  { value: "custom", label: "Custom Template" },
];

export const mockOrderStatuses = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "preparing", label: "Preparing" },
  { value: "ready", label: "Ready" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export const mockSyncModes = [
  { value: "auto", label: "Automatic Sync" },
  { value: "manual", label: "Manual Sync" },
  { value: "offline", label: "Offline Mode" },
];

export const mockDateFormats = [
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
  { value: "DD-MM-YYYY", label: "DD-MM-YYYY" },
];

export const mockTimeFormats = [
  { value: "12h", label: "12 Hour (AM/PM)" },
  { value: "24h", label: "24 Hour" },
];

export const mockServiceChargeApplyOn = [
  { value: "subtotal", label: "Subtotal" },
  { value: "net_total", label: "Net Total (after discounts)" },
  { value: "taxable_amount", label: "Taxable Amount" },
];

export const mockCurrencies = [
  { value: "USD", label: "US Dollar ($)" },
  { value: "EUR", label: "Euro (€)" },
  { value: "GBP", label: "British Pound (£)" },
  { value: "CAD", label: "Canadian Dollar (C$)" },
  { value: "AUD", label: "Australian Dollar (A$)" },
];

export const mockTimezones = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "UTC", label: "UTC" },
];

export const mockLanguages = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
];
