/**
 * Payment method constants
 */

import { CreditCard, Banknote, Smartphone } from "lucide-react";

export const PAYMENT_METHODS = [
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "card", label: "Card", icon: CreditCard },
  { value: "wallet", label: "Wallet", icon: Smartphone },
];
