"use client";

import React from "react";
import { useTheme } from "next-themes";
import Earth from "@/components/ui/globe";
import ScrambleHover from "@/components/ui/scramble";
import { FollowerPointerCard } from "@/components/ui/following-pointer";
import { motion, useInView } from "framer-motion";
import { Suspense, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const featureCards = [
  {
    id: "menu",
    title: "Menu",
    description: "Manage your menu items and pricing with ease.",
    colSpan: "col-span-12 md:col-span-6 xl:col-span-6 xl:col-start-2",
    delay: 0.5,
  },
  {
    id: "orders",
    title: "Orders",
    description: "Process orders quickly and efficiently.",
    colSpan: "col-span-12 md:col-span-6 xl:col-span-6 xl:col-start-8",
    delay: 0.5,
  },
  {
    id: "analytics",
    title: "Analytics",
    description: "Track sales and monitor your business performance.",
    colSpan: "col-span-12 md:col-span-6 xl:col-span-6 xl:col-start-2",
    delay: 1.0,
  },
  {
    id: "multiLocation",
    title: "Multi-location",
    description: "Manage multiple locations from one dashboard.",
    colSpan: "col-span-12 md:col-span-6 xl:col-span-6 xl:col-start-8",
    delay: 1.0,
  },
];

export function FeatureSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const { theme } = useTheme();
  const [hoverStates, setHoverStates] = useState({
    orders: false,
    menu: false,
    analytics: false,
    multiLocation: false,
  });
  const [inputValue, setInputValue] = useState("");

  const globeColors = {
    baseColor: [0.906, 0.541, 0.325],
    glowColor: [0.906, 0.541, 0.325],
    dark: theme === "dark" ? 1 : 0,
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setInputValue("");
    }
  };

  const updateHoverState = (feature, isHovering) => {
    setHoverStates((prev) => ({ ...prev, [feature]: isHovering }));
  };

  const renderFeatureContent = (feature) => {
    switch (feature.id) {
      case "menu":
        return <MenuFeatureContent isHovering={hoverStates.menu} />;
      case "orders":
        return (
          <OrdersFeatureContent
            isHovering={hoverStates.orders}
            globeColors={globeColors}
          />
        );
      case "analytics":
        return (
          <AnalyticsFeatureContent
            inputValue={inputValue}
            setInputValue={setInputValue}
            handleKeyDown={handleKeyDown}
          />
        );
      case "multiLocation":
        return <MultiLocationFeatureContent />;
      default:
        return null;
    }
  };

  return (
    <section
      id="features"
      className="text-foreground relative overflow-hidden py-16"
    >
      <div className="bg-primary absolute -top-10 left-1/2 h-16 w-44 -translate-x-1/2 rounded-full opacity-40 blur-3xl select-none"></div>
      <div className="via-primary/50 absolute top-0 left-1/2 h-px w-3/5 -translate-x-1/2 bg-gradient-to-r from-transparent to-transparent transition-all ease-in-out"></div>

      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.5, delay: 0 }}
        className="container mx-auto flex flex-col items-center gap-6 sm:gap-12"
      >
        <h2 className="via-foreground mb-4 bg-gradient-to-b from-zinc-800 to-zinc-700 bg-clip-text text-center text-4xl font-semibold tracking-tighter text-transparent md:text-[54px] md:leading-[60px]">
          Features
        </h2>

        <FollowerPointerCard
          title={
            <div className="flex items-center gap-2">
              <span>✨</span>
              <span>Features</span>
            </div>
          }
        >
          <div className="cursor-none">
            <div className="grid grid-cols-12 gap-4 justify-center">
              {featureCards.map((feature) => (
                <FeatureCard
                  key={feature.id}
                  feature={feature}
                  isInView={isInView}
                  onHoverChange={(isHovering) =>
                    updateHoverState(feature.id, isHovering)
                  }
                >
                  {renderFeatureContent(feature)}
                </FeatureCard>
              ))}
            </div>
          </div>
        </FollowerPointerCard>
      </motion.div>
    </section>
  );
}

const FeatureCard = ({ feature, isInView, onHoverChange, children }) => (
  <motion.div
    className={cn(
      "group border-secondary/40 text-card-foreground relative flex flex-col overflow-hidden rounded-xl border-2 p-6 shadow-xl transition-all ease-in-out",
      feature.colSpan
    )}
    onMouseEnter={() => onHoverChange(true)}
    onMouseLeave={() => onHoverChange(false)}
    initial={{ opacity: 0, y: 50 }}
    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
    transition={{ duration: 0.5, delay: feature.delay }}
    whileHover={{
      scale: 1.02,
      borderColor: "rgba(231, 138, 83, 0.6)",
      boxShadow: "0 0 30px rgba(231, 138, 83, 0.2)",
    }}
    style={{ transition: "all 0s ease-in-out" }}
  >
    <div className="flex flex-col gap-4">
      <h3 className="text-2xl leading-none font-semibold tracking-tight">
        {feature.title}
      </h3>
      <div className="text-md text-muted-foreground flex flex-col gap-2 text-sm">
        <p className="max-w-[460px]">{feature.description}</p>
      </div>
    </div>
    {children}
  </motion.div>
);

const MenuFeatureContent = ({ isHovering }) => (
  <div className="pointer-events-none flex grow items-center justify-center select-none relative">
    <div className="relative w-full h-[400px] rounded-[20px] overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://framerusercontent.com/images/UjqUIiBHmIcSH9vos9HlG2BF4bo.png"
          alt="Menu Management"
          className="w-full h-full object-cover rounded-xl"
          loading="lazy"
        />
      </div>

      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={isHovering ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 121 94"
          className="absolute"
        >
          <motion.path
            d="M 60.688 1.59 L 60.688 92.449 M 60.688 92.449 L 119.368 92.449 M 60.688 92.449 L 1.414 92.449"
            stroke="rgb(255,222,213)"
            fill="transparent"
            strokeDasharray="2 2"
            initial={{ pathLength: 0 }}
            animate={isHovering ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        </svg>
      </motion.div>
    </div>
  </div>
);

const OrdersFeatureContent = ({ isHovering, globeColors }) => (
  <div className="flex min-h-[300px] grow items-start justify-center select-none">
    <h1 className="mt-8 text-center text-5xl leading-[100%] font-semibold sm:leading-normal lg:mt-12 lg:text-6xl">
      <span className='bg-background relative mt-3 inline-block w-fit rounded-md border px-1.5 py-0.5 before:absolute before:top-0 before:left-0 before:z-10 before:h-full before:w-full before:opacity-[0.09] before:content-[""] before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent'>
        <ScrambleHover
          text="Orders"
          scrambleSpeed={70}
          maxIterations={20}
          useOriginalCharsOnly={false}
          className="cursor-pointer bg-gradient-to-t from-[#e78a53] to-[#e78a53] bg-clip-text text-transparent"
          isHovering={isHovering}
          setIsHovering={() => {}}
          characters="abcdefghijklmnopqrstuvwxyz!@#$%^&*()_+-=[]{}|;':\,./<>?"
        />
      </span>
    </h1>
    <div className="absolute top-64 z-10 flex items-center justify-center">
      <div className="w-[400px] h-[400px]">
        <Suspense
          fallback={
            <div className="bg-secondary/20 h-[400px] w-[400px] animate-pulse rounded-full"></div>
          }
        >
          <Earth {...globeColors} />
        </Suspense>
      </div>
    </div>
  </div>
);

const AnalyticsFeatureContent = ({
  inputValue,
  setInputValue,
  handleKeyDown,
}) => (
  <div className="flex grow items-center justify-center select-none relative min-h-[300px] p-4">
    <div className="w-full max-w-lg">
      <div className="relative rounded-2xl border border-white/10 bg-black/20 dark:bg-white/5 backdrop-blur-sm">
        <div className="p-4">
          <textarea
            className="w-full min-h-[100px] bg-transparent border-none text-white placeholder:text-white/50 resize-none focus:outline-none text-base leading-relaxed"
            placeholder="Search orders, customers, or products..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="flex items-center justify-between px-4 pb-4">
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white/70"
              >
                <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
              </svg>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#e78a53] hover:bg-[#e78a53]/90 transition-colors text-white font-medium">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
                <path d="M2 12h20"></path>
              </svg>
              Find
            </button>
          </div>
          <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white/70"
            >
              <path d="m22 2-7 20-4-9-9-4Z"></path>
              <path d="M22 2 11 13"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
);

const MultiLocationFeatureContent = () => (
  <div className="flex grow items-center justify-center select-none relative min-h-[300px] p-4">
    <div className="relative w-full max-w-sm">
      <img
        src="/modern-grid-layout.png"
        alt="Multi-location Management"
        className="w-full h-auto rounded-lg shadow-lg"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
    </div>
  </div>
);
