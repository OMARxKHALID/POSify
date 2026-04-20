"use client";

import React, { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  UtensilsCrossed,
  ShoppingCart,
  BarChart3,
  MapPin,
  TrendingUp,
  Clock,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils/ui.utils";

const featureCards = [
  {
    id: "menu",
    title: "Dynamic Menu",
    description:
      "Build beautiful, categorized menus with real-time pricing and availability.",
    colSpan: "col-span-12 md:col-span-6 xl:col-span-5 xl:col-start-2",
    icon: UtensilsCrossed,
  },
  {
    id: "orders",
    title: "Smart Order Flow",
    description:
      "Streamline your kitchen with instant synchronization and status tracking.",
    colSpan: "col-span-12 md:col-span-6 xl:col-span-5 xl:col-start-7",
    icon: ShoppingCart,
  },
  {
    id: "analytics",
    title: "Insightful Analytics",
    description:
      "Deep dive into your sales data with modern visualizations and reports.",
    colSpan: "col-span-12 md:col-span-6 xl:col-span-5 xl:col-start-2",
    icon: BarChart3,
  },
  {
    id: "multiLocation",
    title: "Global Management",
    description:
      "Control all your branches from a single, unified command center.",
    colSpan: "col-span-12 md:col-span-6 xl:col-span-5 xl:col-start-7",
    icon: MapPin,
  },
];

export function FeatureSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [hoveredId, setHoveredId] = useState(null);

  const renderFeatureContent = (id) => {
    switch (id) {
      case "menu":
        return <MenuWOW isHovered={hoveredId === "menu"} />;
      case "orders":
        return <OrdersWOW isHovered={hoveredId === "orders"} />;
      case "analytics":
        return <AnalyticsWOW isHovered={hoveredId === "analytics"} />;
      case "multiLocation":
        return <MultiLocationWOW isHovered={hoveredId === "multiLocation"} />;
      default:
        return null;
    }
  };

  return (
    <section id="features" className="relative py-24 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            className="flex justify-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-xs font-black uppercase tracking-widest text-primary shadow-[0_0_15px_rgba(var(--primary),0.1)]">
              <Sparkles className="h-4 w-4" />
              <span>Features</span>
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            className="text-4xl md:text-6xl font-bold tracking-tight text-foreground"
          >
            Powerful Features
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            Everything you need to run a high-performance hospitality business.
          </motion.p>
        </div>

        <div ref={ref} className="grid grid-cols-12 gap-4">
          {featureCards.map((feature) => (
            <motion.div
              key={feature.id}
              className={cn(
                "group relative rounded-3xl border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden p-6 transition-all hover:border-primary/50",
                feature.colSpan,
              )}
              onMouseEnter={() => setHoveredId(feature.id)}
              onMouseLeave={() => setHoveredId(null)}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: featureCards.indexOf(feature) * 0.1,
                ease: "easeOut",
              }}
            >
              <div className="relative z-10 space-y-4 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-3xl font-bold tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-base max-w-sm">
                  {feature.description}
                </p>
              </div>

              <div className="relative h-[300px] w-full flex items-center justify-center">
                {renderFeatureContent(feature.id)}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const MenuWOW = ({ isHovered }) => {
  const items = [
    { name: "Margherita", price: "$14", color: "bg-orange-500", icon: "🍕" },
    { name: "Espresso", price: "$4", color: "bg-brown-600", icon: "☕" },
    { name: "Salad Bowl", price: "$12", color: "bg-green-500", icon: "🥗" },
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="relative w-48 h-32">
        {items.map((item, i) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: isHovered ? 1 : 1 - i * 0.05,
              y: isHovered ? (i - 1) * 55 : i * -5,
              x: isHovered ? (i - 1) * 15 : 0,
              rotate: isHovered ? (i - 1) * 5 : 0,
              zIndex: 10 - i,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute inset-0 p-5 rounded-2xl bg-background border border-border/50 shadow-2xl flex flex-col gap-4"
          >
            <div className="flex justify-between items-center">
              <div
                className={cn(
                  "w-11 h-11 rounded-xl flex items-center justify-center text-2xl shadow-inner",
                  item.color + "/20",
                )}
              >
                {item.icon}
              </div>
              <span className="text-sm font-mono text-primary font-bold">
                {item.price}
              </span>
            </div>
            <div className="space-y-2">
              <div className="h-2 w-full bg-muted rounded-full" />
              <div className="h-1.5 w-2/3 bg-muted/50 rounded-full" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const OrdersWOW = ({ isHovered }) => {
  const orders = [
    {
      id: "#104",
      item: "🍔 Burger Combo",
      status: "Ready",
      color: "text-green-500",
      bg: "bg-green-500",
    },
    {
      id: "#103",
      item: "☕ Latte",
      status: "Preparing",
      color: "text-orange-500",
      bg: "bg-orange-500",
    },
    {
      id: "#102",
      item: "🍕 Pepperoni",
      status: "New",
      color: "text-primary",
      bg: "bg-primary",
    },
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="w-full max-w-[280px] space-y-3">
        {orders.map((order, i) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{
              opacity: 1,
              x: 0,
              y: isHovered ? 0 : i * 4,
              scale: isHovered ? 1 : 1 - i * 0.03,
            }}
            transition={{
              delay: i * 0.1,
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
            className="flex items-center gap-3 rounded-xl bg-background border border-border/50 px-4 py-3 shadow-lg"
          >
            <div className="text-lg">{order.item.split(" ")[0]}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">
                {order.item.split(" ").slice(1).join(" ")}
              </div>
              <div className="text-[10px] text-muted-foreground font-mono">
                {order.id}
              </div>
            </div>
            <motion.div
              animate={
                isHovered && order.status === "Preparing"
                  ? { opacity: [1, 0.4, 1] }
                  : {}
              }
              transition={{ duration: 1.5, repeat: Infinity }}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                order.bg + "/15",
                order.color,
              )}
            >
              {order.status === "Ready" && <CheckCircle2 size={10} />}
              {order.status === "Preparing" && <Clock size={10} />}
              {order.status === "New" && <ShoppingCart size={10} />}
              {order.status}
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const AnalyticsWOW = ({ isHovered }) => {
  const bars = [40, 75, 45, 95, 65, 85, 55];

  return (
    <div className="w-full max-w-[280px] mx-auto space-y-4">
      <div className="flex items-end justify-between h-32 gap-2">
        {bars.map((height, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: isHovered ? `${height}%` : "25%" }}
            transition={{ delay: i * 0.1, duration: 0.6, type: "spring" }}
            className="flex-1 bg-primary/20 rounded-t-md relative group"
          >
            <div className="absolute inset-0 bg-primary opacity-30 rounded-t-md group-hover:opacity-60 transition-opacity" />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-background border border-border/50 space-y-1.5 shadow-lg">
          <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
            Revenue
          </span>
          <div className="flex items-center justify-between">
            <span className="text-base font-black">$42.5k</span>
            <TrendingUp size={14} className="text-green-500" />
          </div>
        </div>
        <div className="p-3 rounded-xl bg-background border border-border/50 space-y-1.5 shadow-lg">
          <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
            Growth
          </span>
          <div className="flex items-center justify-between">
            <span className="text-base font-black">+18%</span>
            <TrendingUp size={14} className="text-green-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

const MultiLocationWOW = ({ isHovered }) => {
  const locations = [
    { label: "London", flag: "🇬🇧", val: "$8.2k", trend: "+12%" },
    { label: "New York", flag: "🇺🇸", val: "$12.4k", trend: "+18%" },
    { label: "Tokyo", flag: "🇯🇵", val: "$6.1k", trend: "+9%" },
    { label: "Paris", flag: "🇫🇷", val: "$4.9k", trend: "+15%" },
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="w-full max-w-[280px] grid grid-cols-2 gap-2.5">
        {locations.map((loc, i) => (
          <motion.div
            key={loc.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: isHovered ? 1.03 : 1,
            }}
            transition={{
              delay: i * 0.08,
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
            className="rounded-xl bg-background border border-border/50 p-3 shadow-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{loc.flag}</span>
              <span className="text-xs font-bold uppercase tracking-wide truncate">
                {loc.label}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-base font-black">{loc.val}</span>
              <motion.span
                animate={
                  isHovered ? { opacity: [0.6, 1, 0.6] } : { opacity: 0.6 }
                }
                transition={{ duration: 2, repeat: Infinity }}
                className="text-[10px] font-bold text-green-500"
              >
                {loc.trend}
              </motion.span>
            </div>
            {isHovered && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: i * 0.1 + 0.2, duration: 0.4 }}
                className="mt-2 h-1 rounded-full bg-primary/20 origin-left"
              >
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 0.4 + i * 0.15 }}
                  transition={{ delay: i * 0.1 + 0.4, duration: 0.5 }}
                  className="h-full rounded-full bg-primary origin-left"
                />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
