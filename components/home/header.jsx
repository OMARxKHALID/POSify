"use client";

import { useState } from "react";
import Link from "next/link";
import { useScroll } from "@/hooks/use-scroll";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
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
        <Link
          href="/"
          className={`flex items-center gap-2 transition-all duration-300 ${
            isScrolled ? "ml-4" : ""
          }`}
        >
          <Logo className="h-8 w-8" />
        </Link>

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
        <div className="relative z-10 flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" asChild>
            <Link href="/admin/login">Log In</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Register</Link>
          </Button>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="sticky top-4 z-50 mx-2 sm:mx-4 flex items-center justify-between rounded-full border border-border/50 bg-background/80 px-3 sm:px-4 py-2 sm:py-3 shadow-lg backdrop-blur-sm md:hidden">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-7 w-7" />
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border/50 bg-background/50 hover:bg-background/80 transition-colors touch-manipulation"
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
                <Button
                  variant="ghost"
                  asChild
                  className="justify-start h-12 text-lg"
                >
                  <Link href="/admin/login">Log In</Link>
                </Button>
                <Button asChild className="h-12 text-lg font-semibold">
                  <Link href="/register">Register</Link>
                </Button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
