"use client";

import { useTheme } from "@/components/theme-provider";

export function GeometricBackground({ className = "" }) {
  const { theme } = useTheme();

  // Determine if we're in dark mode
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <div
      className={`absolute inset-0 z-0 ${className}`}
      style={{
        backgroundColor: isDark ? "#0a0a0a" : "#fafafa",
        backgroundImage: isDark
          ? `
              radial-gradient(circle at 25% 25%, #222222 0.5px, transparent 1px),
              radial-gradient(circle at 75% 75%, #111111 0.5px, transparent 1px)
            `
          : `
              radial-gradient(circle at 25% 25%, #e5e5e5 0.5px, transparent 1px),
              radial-gradient(circle at 75% 75%, #d4d4d4 0.5px, transparent 1px)
            `,
        backgroundSize: "10px 10px",
        imageRendering: "pixelated",
      }}
    />
  );
}
