"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const FOOTER_LINKS = [
  {
    title: "Main",
    links: ["Home", "Docs", "Components"],
  },
  {
    title: "Community",
    links: ["Github", "Twitter", "Discord"],
  },
];

export function Footer() {
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = window.scrollY;
          const windowHeight = window.innerHeight;
          const documentHeight = document.documentElement.scrollHeight;
          const nearBottom = scrollTop + windowHeight >= documentHeight - 100;

          setIsAtBottom(nearBottom);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // run once on mount
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isAtBottom && (
        <motion.footer
          className="fixed bottom-0 left-0 z-40 h-80 w-full border-t border-[#e78a53]/20 bg-gradient-to-b from-[#e78a53] to-[#e78a53]/90 backdrop-blur-sm"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className="relative flex h-full w-full items-start justify-end overflow-hidden px-8 py-8 text-right sm:px-12 sm:py-12">
            {/* Links */}
            <motion.div
              className="flex flex-row space-x-8 text-sm sm:space-x-12 sm:text-base md:space-x-16 md:text-lg lg:space-x-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {FOOTER_LINKS.map((group) => (
                <ul key={group.title} className="space-y-3">
                  {group.links.map((link) => (
                    <li
                      key={link}
                      className="cursor-pointer text-black/90 transition-colors duration-200 hover:text-black hover:underline"
                    >
                      {link}
                    </li>
                  ))}
                </ul>
              ))}
            </motion.div>

            {/* Brand */}
            <motion.h2
              className="absolute bottom-0 left-0 select-none text-[80px] font-bold text-black/90 sm:text-[120px] md:text-[160px] lg:text-[192px] translate-y-1/3"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              POSIFY
            </motion.h2>
          </div>
        </motion.footer>
      )}
    </AnimatePresence>
  );
}
