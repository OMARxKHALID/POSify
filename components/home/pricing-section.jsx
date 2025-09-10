"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { useState } from "react";

const pricingPlans = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for small businesses",
    features: ["50 menu items", "Basic orders", "Email support", "1 location"],
    popular: false,
    cta: "Get Started",
  },
  {
    name: "Pro",
    monthlyPrice: 29,
    annualPrice: 24,
    description: "For growing businesses",
    features: [
      "Unlimited menu items",
      "Analytics",
      "Priority support",
      "Multi-location",
      "Custom branding",
      "API access",
    ],
    popular: true,
    cta: "Start Free Trial",
  },
  {
    name: "Enterprise",
    monthlyPrice: 99,
    annualPrice: 79,
    description: "For large businesses",
    features: [
      "Everything in Pro",
      "Unlimited locations",
      "White-label",
      "Advanced reporting",
      "Custom integrations",
      "Dedicated support",
    ],
    popular: false,
    cta: "Contact Sales",
  },
];

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section className="relative px-4 py-16">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-8 text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-3 inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/50 px-4 py-2 backdrop-blur-sm"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground/80">
              Pricing
            </span>
          </motion.div>

          <h2 className="mb-2 bg-gradient-to-r from-foreground via-foreground to-foreground/60 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
            Choose your plan
          </h2>

          <p className="mx-auto mb-4 max-w-2xl text-lg text-muted-foreground">
            Start with our free trial. Upgrade anytime as your business grows.
          </p>

          {/* Monthly / Annual Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="mx-auto flex w-fit items-center gap-4 rounded-full border border-border/50 bg-card/50 p-1 backdrop-blur-sm"
          >
            <button
              onClick={() => setIsAnnual(false)}
              className={`rounded-full px-6 py-2 text-sm font-medium transition-all duration-200 ${
                !isAnnual
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "text-muted-foreground hover:text-foreground/80"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`relative rounded-full px-6 py-2 text-sm font-medium transition-all duration-200 ${
                isAnnual
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "text-muted-foreground hover:text-foreground/80"
              }`}
            >
              Annual
              <span className="absolute -top-2 -right-2 rounded-full bg-emerald-500 px-2 py-0.5 text-xs text-white">
                Save 20%
              </span>
            </button>
          </motion.div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
          {pricingPlans.map((plan, index) => {
            const price =
              plan.price ??
              `$${isAnnual ? plan.annualPrice : plan.monthlyPrice}`;

            const priceSuffix = plan.price || (isAnnual ? "/year" : "/month");

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className={`relative rounded-2xl border p-8 backdrop-blur-sm transition-all duration-300 ${
                  plan.popular
                    ? "border-primary/30 bg-gradient-to-b from-primary/10 to-transparent shadow-lg shadow-primary/10"
                    : "border-border/50 bg-card/50 hover:border-border"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="rounded-full bg-gradient-to-r from-primary to-primary/80 px-4 py-2 text-sm font-medium text-primary-foreground">
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Card Content */}
                <div className="mb-8 text-center">
                  <h3 className="mb-2 text-xl font-bold text-foreground">
                    {plan.name}
                  </h3>
                  <div className="mb-2 flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-foreground">
                      {price}
                    </span>
                    <span className="text-lg text-muted-foreground">
                      {priceSuffix}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                </div>

                {/* Features */}
                <ul className="mb-8 space-y-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <Check className="h-5 w-5 flex-shrink-0 text-primary" />
                      <span className="text-sm text-foreground/80">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full rounded-lg px-6 py-3 font-medium transition-all duration-200 ${
                    plan.popular
                      ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40"
                      : "border border-border bg-card text-card-foreground hover:bg-accent"
                  }`}
                >
                  {plan.cta}
                </motion.button>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="mb-4 text-muted-foreground">
            Need a custom solution for your business? We're here to help.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="font-medium text-primary transition-colors hover:text-primary/80"
          >
            Schedule a demo →
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
