"use client";

import { useState } from "react";
import { useScroll } from "@/hooks/use-scroll";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_ITEMS = ["features", "pricing", "testimonials", "faq"];

export function Header() {
  const { isScrolled } = useScroll();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (id) => {
    setIsMobileMenuOpen(false);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (!el) return;

      const headerOffset = 120;
      const position = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: position - headerOffset,
        behavior: "smooth",
      });
    }, 100);
  };

  return (
    <>
      {/* Desktop Header */}
      <header
        className={`sticky top-4 z-50 mx-auto hidden w-full items-center justify-between rounded-full border border-border/50 bg-background/80 px-4 py-2 shadow-lg backdrop-blur-sm md:flex transition-all duration-200 ${
          isScrolled ? "max-w-4xl px-2" : "max-w-5xl px-4"
        }`}
      >
        {/* Logo */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-2 transition-all duration-300 ${
            isScrolled ? "ml-4" : ""
          }`}
        >
          <Logo className="h-8 w-8" />
        </a>

        {/* Nav */}
        <nav className="absolute inset-0 hidden flex-1 items-center justify-center md:flex pointer-events-none">
          {NAV_ITEMS.map((item) => (
            <button
              key={item}
              onClick={() => scrollToSection(item)}
              className="relative px-4 py-2 text-sm font-medium capitalize text-muted-foreground hover:text-foreground transition-colors cursor-pointer pointer-events-auto"
            >
              {item}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div className="relative z-10 flex items-center gap-4">
          <ThemeToggle />
          <a
            href="/login"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Log In
          </a>
          <a
            href="/signup"
            className="inline-block rounded-md bg-gradient-to-b from-primary to-primary/80 px-4 py-2 text-sm font-bold text-primary-foreground shadow-[inset_0_2px_0_hsl(var(--primary-foreground)/0.3)] transition duration-200 hover:-translate-y-0.5"
          >
            Sign Up
          </a>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="sticky top-4 z-50 mx-4 flex items-center justify-between rounded-full border border-border/50 bg-background/80 px-4 py-3 shadow-lg backdrop-blur-sm md:hidden">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2"
        >
          <Logo className="h-7 w-7" />
        </a>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border/50 bg-background/50 hover:bg-background/80 transition-colors"
          >
            <div className="flex h-5 w-5 flex-col items-center justify-center space-y-1">
              <span
                className={`block h-0.5 w-4 bg-foreground transition-transform duration-300 ${
                  isMobileMenuOpen ? "translate-y-1.5 rotate-45" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-4 bg-foreground transition-opacity duration-300 ${
                  isMobileMenuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-4 bg-foreground transition-transform duration-300 ${
                  isMobileMenuOpen ? "-translate-y-1.5 -rotate-45" : ""
                }`}
              />
            </div>
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background/50 backdrop-blur-sm md:hidden">
          <div className="absolute top-20 left-4 right-4 rounded-2xl border border-border/50 bg-background/95 p-6 shadow-2xl backdrop-blur-md">
            <nav className="flex flex-col space-y-4">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item)}
                  className="rounded-lg px-4 py-3 text-left text-lg font-medium capitalize text-muted-foreground hover:bg-background/50 hover:text-foreground transition-colors"
                >
                  {item}
                </button>
              ))}
              <div className="mt-4 flex flex-col space-y-3 border-t border-border/50 pt-4">
                <a
                  href="/login"
                  className="rounded-lg px-4 py-3 text-lg font-medium text-muted-foreground hover:bg-background/50 hover:text-foreground transition-colors"
                >
                  Log In
                </a>
                <a
                  href="/signup"
                  className="rounded-lg bg-gradient-to-b from-primary to-primary/80 px-4 py-3 text-center text-lg font-bold text-primary-foreground shadow-lg transition-transform duration-200 hover:-translate-y-0.5"
                >
                  Sign Up
                </a>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
