"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function FaqSection() {
  const [openItems, setOpenItems] = useState([]);

  const toggleItem = (index) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

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

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section id="faq" className="relative overflow-hidden py-16 pb-32 z-10">
      {/* Background blur effects */}
      <div className="absolute top-1/2 -right-20 z-[-1] h-64 w-64 rounded-full bg-primary/20 opacity-80 blur-3xl" />
      <div className="absolute top-1/2 -left-20 z-[-1] h-64 w-64 rounded-full bg-primary/20 opacity-80 blur-3xl" />

      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 px-3 py-1 uppercase text-primary">
            <span>✶</span>
            <span className="text-sm">Faqs</span>
          </div>
        </motion.div>

        <motion.h2
          className="mx-auto mt-3 max-w-xl text-center text-4xl font-medium md:text-[54px] md:leading-[60px]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Questions? We've got{" "}
          <span className="bg-gradient-to-b from-foreground via-foreground/60 to-primary bg-clip-text text-transparent">
            answers
          </span>
        </motion.h2>

        {/* FAQ Items */}
        <motion.div
          className="mx-auto mt-6 flex max-w-xl flex-col gap-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {faqs.map((faq, index) => {
            const isOpen = openItems.includes(index);

            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="cursor-pointer rounded-2xl border border-border/50 bg-gradient-to-b from-secondary/40 to-secondary/10 p-6 shadow-[inset_0_2px_0_hsl(var(--foreground)/0.1)] transition-all duration-300 hover:border-border"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleItem(index)}
                role="button"
                tabIndex={0}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${index}`}
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
                      <Minus
                        className="flex-shrink-0 text-primary transition duration-300"
                        size={24}
                      />
                    ) : (
                      <Plus
                        className="flex-shrink-0 text-primary transition duration-300"
                        size={24}
                      />
                    )}
                  </motion.div>
                </div>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      id={`faq-answer-${index}`}
                      className="mt-4 overflow-hidden text-muted-foreground leading-relaxed"
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{
                        duration: 0.4,
                        ease: "easeInOut",
                        opacity: { duration: 0.2 },
                      }}
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
