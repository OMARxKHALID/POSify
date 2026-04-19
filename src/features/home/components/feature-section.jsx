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
  DollarSign,
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
    <section
      id="features"
      className="relative py-24 overflow-hidden bg-background"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
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

        <div ref={ref} className="grid grid-cols-12 gap-8">
          {featureCards.map((feature) => (
            <motion.div
              key={feature.id}
              className={cn(
                "group relative rounded-3xl border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden p-10 transition-all hover:border-primary/50",
                feature.colSpan,
              )}
              onMouseEnter={() => setHoveredId(feature.id)}
              onMouseLeave={() => setHoveredId(null)}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
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

              <div className="relative h-[380px] w-full flex items-center justify-center overflow-hidden">
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
    <div className="relative w-full h-full flex items-center justify-center scale-110">
      <div className="relative w-56 h-40">
        {items.map((item, i) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: isHovered ? 1.1 : 1 - i * 0.05,
              y: isHovered ? (i - 1) * 85 : i * -6,
              x: isHovered ? (i - 1) * 30 : 0,
              rotate: isHovered ? (i - 1) * 8 : 0,
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
  return (
    <div className="relative flex items-center justify-center w-full h-full scale-110">
      <div className="relative w-56 h-56">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-2 border-dashed border-primary/30"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-6 rounded-full border-2 border-dashed border-primary/20"
        />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-primary/20 border-2 border-primary/50 flex items-center justify-center shadow-2xl">
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-6 rounded-full bg-primary shadow-[0_0_20px_rgba(var(--primary),0.5)]"
          />
        </div>

        {isHovered &&
          [0, 90, 180, 270].map((angle, i) => (
            <motion.div
              key={i}
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.7,
              }}
              className="absolute inset-0"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_12px_rgba(var(--primary),1)]" />
            </motion.div>
          ))}

        {[
          {
            icon: Clock,
            label: "Preparing",
            pos: "-top-4 -left-12",
            color: "text-orange-500",
          },
          {
            icon: CheckCircle2,
            label: "Ready",
            pos: "-bottom-4 -right-16",
            color: "text-green-500",
          },
        ].map((badge, i) => (
          <motion.div
            key={i}
            animate={isHovered ? { y: [0, -10, 0] } : {}}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
            className={cn(
              "absolute px-5 py-2.5 rounded-full bg-background border border-border/50 shadow-2xl flex items-center gap-3 text-xs font-bold uppercase tracking-widest",
              badge.pos,
            )}
          >
            <badge.icon className={badge.color} size={14} />
            <span className="opacity-90">{badge.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const AnalyticsWOW = ({ isHovered }) => {
  const bars = [40, 75, 45, 95, 65, 85, 55];

  return (
    <div className="w-full max-w-sm space-y-10 scale-110">
      <div className="flex items-end justify-between h-40 gap-3 px-6">
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

      <div className="grid grid-cols-2 gap-6 px-6">
        <div className="p-4 rounded-2xl bg-background border border-border/50 space-y-2 shadow-xl">
          <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
            Revenue
          </span>
          <div className="flex items-center justify-between">
            <span className="text-lg font-black">$42.5k</span>
            <TrendingUp size={16} className="text-green-500" />
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-background border border-border/50 space-y-2 shadow-xl">
          <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
            Growth
          </span>
          <div className="flex items-center justify-between">
            <span className="text-lg font-black">+18%</span>
            <TrendingUp size={16} className="text-green-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

const MultiLocationWOW = ({ isHovered }) => {
  const nodes = [
    { label: "London", x: -120, y: -70, val: "$8.2k" },
    { label: "New York", x: 130, y: -40, val: "$12.4k" },
    { label: "Tokyo", x: 30, y: 110, val: "$6.1k" },
    { label: "Paris", x: -90, y: 80, val: "$4.9k" },
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center scale-105">
      <motion.div
        animate={{ scale: [1, 1.4, 1], opacity: [0.15, 0.08, 0.15] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute w-80 h-80 rounded-full bg-primary/20 blur-[60px]"
      />

      <div className="relative">
        <div className="w-18 h-18 rounded-full bg-primary/10 border-2 border-primary/50 flex items-center justify-center relative z-20 shadow-[0_0_40px_rgba(var(--primary),0.2)]">
          <motion.div
            animate={isHovered ? { rotate: 360 } : {}}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          >
            <DollarSign className="text-primary" size={28} />
          </motion.div>
          <div className="absolute inset-0 rounded-full border-2 border-primary/40 animate-ping opacity-20" />
        </div>

        {nodes.map((node, i) => (
          <motion.div
            key={node.label}
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              x: isHovered ? node.x : 0,
              y: isHovered ? node.y : 0,
            }}
            transition={{
              duration: 0.7,
              type: "spring",
              bounce: 0.4,
              delay: i * 0.06,
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <div className="flex flex-col items-center gap-2 group/node">
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{
                    opacity: 0.25,
                    width: Math.sqrt(node.x ** 2 + node.y ** 2),
                  }}
                  className="absolute top-1/2 left-1/2 origin-left h-[1.5px] bg-primary/60 -z-10 shadow-[0_0_8px_rgba(var(--primary),0.3)]"
                  style={{
                    rotate: Math.atan2(-node.y, -node.x) * (180 / Math.PI),
                  }}
                />
              )}

              <div className="w-11 h-11 rounded-full bg-background border-2 border-primary/30 flex items-center justify-center shadow-2xl group-hover/node:border-primary transition-all duration-300">
                <MapPin size={16} className="text-primary" />
              </div>
              <div className="flex flex-col items-center bg-background/95 border border-border/50 px-4 py-1.5 rounded-lg shadow-2xl min-w-[90px] backdrop-blur-md">
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {node.label}
                </span>
                <span className="text-[9px] text-green-500 font-mono font-black">
                  {node.val}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
