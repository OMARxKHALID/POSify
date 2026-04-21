export const mockSettings = {
  _id: "settings_001",
  organizationId: "org_001",

  taxes: [
    {
      _id: "tax_001",
      name: "Sales Tax",
      rate: 8.5,
      enabled: true,
      type: "percentage",
    },
    {
      _id: "tax_002",
      name: "City Tax",
      rate: 1.0,
      enabled: true,
      type: "percentage",
    },
    {
      _id: "tax_003",
      name: "Service Fee",
      rate: 2.5,
      enabled: false,
      type: "fixed",
    },
  ],

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

  operational: {
    orderManagement: {
      defaultStatus: "pending",
    },
    demoMode: true,
  },

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
  },

  currency: "USD",

  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-15T12:00:00Z",
};