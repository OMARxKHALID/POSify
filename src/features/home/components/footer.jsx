"use client";

import Link from "next/link";
import { Github, Twitter, MessageCircle, ArrowRight } from "lucide-react";

const FOOTER_LINKS = [
  {
    title: "Product",
    links: [
      { name: "Features", href: "#features" },
      { name: "Pricing", href: "#pricing" },
      { name: "Documentation", href: "/docs" },
      { name: "Release Notes", href: "/releases" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About Us", href: "/about" },
      { name: "Careers", href: "/careers" },
      { name: "Contact", href: "/contact" },
      { name: "Privacy Policy", href: "/privacy" },
    ],
  },
  {
    title: "Community",
    links: [
      { name: "GitHub", href: "https://github.com", icon: Github },
      { name: "Twitter", href: "https://twitter.com", icon: Twitter },
      { name: "Discord", href: "https://discord.com", icon: MessageCircle },
    ],
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-24 px-4 pb-12 sm:px-6 lg:px-8 overflow-hidden">
      <div className="mx-auto max-w-7xl rounded-[32px] border border-border/50 bg-card/30 backdrop-blur-xl overflow-hidden pt-20 pb-10 px-8 sm:px-12">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 relative z-10">
          <div className="lg:col-span-4 space-y-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black text-xl shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
                P
              </div>
              <span className="text-2xl font-black tracking-tighter">
                POSIFY
              </span>
            </Link>

            <p className="text-muted-foreground text-lg max-w-xs leading-relaxed">
              The modern operating system for high-performance hospitality
              businesses.
            </p>

            <div className="flex items-center gap-4">
              {FOOTER_LINKS[2].links.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 rounded-full border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all bg-background/50 backdrop-blur-sm"
                >
                  <social.icon size={18} />
                </Link>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8 relative z-10">
            {FOOTER_LINKS.map((group) => (
              <div key={group.title} className="space-y-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-foreground/50">
                  {group.title}
                </h3>
                <ul className="space-y-4">
                  {group.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                      >
                        {link.name}
                        <ArrowRight
                          size={12}
                          className="opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="my-12 h-px w-full bg-gradient-to-r from-transparent via-border to-transparent opacity-50 relative z-10" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {currentYear} POSify Inc. All rights reserved. Built with
            precision for the modern web.
          </p>

          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            <Link
              href="/terms"
              className="hover:text-foreground transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
          </div>
        </div>

        <div className="absolute -bottom-10 -left-10 text-[15vw] font-black text-foreground/[0.03] select-none pointer-events-none tracking-tighter">
          POSIFY
        </div>
      </div>
    </footer>
  );
}
