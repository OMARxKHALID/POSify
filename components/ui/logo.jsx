"use client";

import Image from "next/image";
import { useTheme } from "@/components/theme-provider";
import { useEffect, useState } from "react";

export function Logo({ className = "w-5 h-5", ...props }) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle system theme and determine if dark mode
  const isDark = (() => {
    if (!mounted) return false; // Prevent hydration mismatch

    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return theme === "dark";
  })();

  const logoSrc = isDark ? "/favicon-dark.svg" : "/favicon-light.svg";

  // Show fallback during hydration to prevent mismatch
  if (!mounted) {
    return (
      <Image
        src="/favicon.svg"
        alt="POSify Logo"
        width={20}
        height={20}
        className={className}
        {...props}
      />
    );
  }

  return (
    <Image
      src={logoSrc}
      alt="POSify Logo"
      width={20}
      height={20}
      className={className}
      {...props}
    />
  );
}
