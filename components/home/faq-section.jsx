"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "What is POSify?",
    answer:
      "POSify is a modern point of sale system for restaurants and retail businesses. Manage orders, track sales, and grow your business.",
  },
  {
    question: "Is it easy to use?",
    answer:
      "Yes! POSify is designed to be simple and intuitive. No technical knowledge required.",
  },
  {
    question: "Can I manage multiple locations?",
    answer: "Yes! Manage multiple restaurants or stores from one dashboard.",
  },
  {
    question: "How quickly can I get started?",
    answer:
      "Start immediately with our free trial. Most businesses are up and running within 24 hours.",
  },
];

export function FaqSection() {
  const [openItems, setOpenItems] = useState([]);

  const toggleItem = (index) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <motion.section
      id="faq"
      className="relative overflow-hidden py-16 pb-32"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Background effects */}
      <div className="absolute top-1/2 -right-20 h-64 w-64 rounded-full bg-primary/20 opacity-80 blur-3xl" />
      <div className="absolute top-1/2 -left-20 h-64 w-64 rounded-full bg-primary/20 opacity-80 blur-3xl" />

      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 px-3 py-1 text-sm uppercase text-primary">
            <span>✶</span>
            <span>FAQs</span>
          </div>

          <h2 className="mx-auto mt-3 max-w-xl text-4xl font-medium md:text-5xl">
            Questions? We've got{" "}
            <span className="bg-gradient-to-b from-foreground via-foreground/60 to-primary bg-clip-text text-transparent">
              answers
            </span>
          </h2>
        </div>

        {/* FAQ Items */}
        <div className="mx-auto mt-6 max-w-xl space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openItems.includes(index);

            return (
              <div
                key={index}
                className="cursor-pointer rounded-2xl border border-border/50 bg-gradient-to-b from-secondary/40 to-secondary/10 p-6 shadow-[inset_0_2px_0_hsl(var(--foreground)/0.1)] transition-all duration-300 hover:border-border"
                onClick={() => toggleItem(index)}
                role="button"
                tabIndex={0}
                aria-expanded={isOpen}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleItem(index);
                  }
                }}
              >
                <div className="flex items-start justify-between">
                  <h3 className="pr-4 font-medium">{faq.question}</h3>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    {isOpen ? (
                      <Minus className="h-6 w-6 text-primary" />
                    ) : (
                      <Plus className="h-6 w-6 text-primary" />
                    )}
                  </motion.div>
                </div>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      className="mt-4 text-muted-foreground leading-relaxed"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
