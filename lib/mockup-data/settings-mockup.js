

export const mockSettings = {
  id: "settings_001",
  organizationId: "org_001",


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


  payment: {
    defaultMethod: "card",
    preferredMethods: ["card", "cash", "digital"],
    cashHandling: {
      enableCashDrawer: true,
      requireExactChange: false,
    },
  },


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


  customerPreferences: {
    requireCustomerPhone: false,
    requireCustomerName: false,
    allowGuestCheckout: true,
    enableCustomerDatabase: true,
  },


  operational: {
    orderManagement: {
      defaultStatus: "pending",
      orderNumberFormat: "ORD-{YYYY}-{seq}",
      autoConfirmOrders: false,
    },
    syncMode: "auto",
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
    discountRules: {
      maxDiscountPercentage: 20,
    },
  },


  currency: "USD",
  timezone: "America/New_York",
  language: "en",
  dateFormat: "MM/DD/YYYY",
  timeFormat: "12h",

  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-15T12:00:00Z",
};


