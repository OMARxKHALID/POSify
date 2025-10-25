"use client";

import { useSession, signOut } from "next-auth/react";
import { LogOut, LayoutDashboard, User } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { SimpleUserDisplay } from "@/components/ui/user-info";
import Link from "next/link";

export function DashboardHeader() {
  const { data: session } = useSession();

  return (
    <header className="bg-card border-b border-border px-4 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <div className="p-2 bg-primary/10 rounded-lg">
              <Logo className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-semibold text-card-foreground">
              POSIFY
            </h1>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          {session && (
            <div className="flex items-center space-x-4">
              <SimpleUserDisplay session={session} />

              {/* Navigation Links */}
              <div className="flex items-center gap-2">
                <Link href="/admin/dashboard">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Button>
                </Link>

                {/* POS Access for Admin/Staff */}
                {(session.user.role === "admin" ||
                  session.user.role === "staff") && (
                  <Link href="/pos">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-1"
                    >
                      <User className="h-4 w-4" />
                      <span>POS</span>
                    </Button>
                  </Link>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: "/admin/login" })}
                  className="flex items-center space-x-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
