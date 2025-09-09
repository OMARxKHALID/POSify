"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User, LayoutDashboard } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/ui/logo";
import Link from "next/link";

export default function Header() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <header className="bg-card border-b border-border px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="h-8 w-32 bg-muted rounded animate-pulse"></div>
          <div className="h-8 w-8 bg-muted rounded-full animate-pulse"></div>
        </div>
      </header>
    );
  }

  if (!session) {
    return null;
  }

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
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-muted-foreground">
              {session.user?.name || session.user?.email}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <ThemeToggle />
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="flex items-center space-x-1"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
