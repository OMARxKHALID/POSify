"use client";

import { cn } from "@/lib/utils";

export function GeometricBackground({ className = "", animated = false }) {
  return (
    <div
      className={cn(
        "absolute inset-0 z-0",
        "geometric-pattern",
        animated && "animate-pulse",
        className
      )}
    />
  );
}
