"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  const getIcon = () => {
    if (theme === "light") {
      return <Sun className="h-4 w-4" />;
    } else {
      return <Moon className="h-4 w-4" />;
    }
  };

  const getTooltip = () => {
    if (theme === "light") {
      return "Switch to dark mode";
    } else {
      return "Switch to light mode";
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="h-9 w-9 p-0"
      title={getTooltip()}
    >
      {getIcon()}
      <span className="sr-only">{getTooltip()}</span>
    </Button>
  );
}
