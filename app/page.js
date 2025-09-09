"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Logo } from "@/components/ui/logo";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/20 to-accent/20">
      <DashboardHeader />
      <div className="flex items-center justify-center p-4 pt-20">
        <div className="max-w-4xl w-full space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-primary/10 rounded-xl shadow-sm">
              <Logo className="w-10 h-10" />
            </div>
            <h1 className="text-5xl font-bold text-foreground">
              Welcome to POSify
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Modern Point of Sale system for restaurants and retail businesses.
              Manage your operations efficiently with our comprehensive
              solution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2">
                  <Logo className="w-5 h-5" />
                  Business Owner
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Create your business account and start managing your
                  operations
                </p>
                <Link href="/register">
                  <Button className="w-full">
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2">
                  <Logo className="w-5 h-5" />
                  Admin Access
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Sign in to your admin dashboard to manage your business
                </p>
                <Link href="/admin/login">
                  <Button variant="outline" className="w-full">
                    Sign In
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
