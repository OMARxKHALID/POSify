"use client";

import { useSession } from "next-auth/react";
import { PageLoading } from "@/components/ui/loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Store,
  Users,
  ShoppingCart,
  TrendingUp,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  CreditCard,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import MainHeader from "@/components/main-header";
import { useOrganization, useOrganizationStats } from "@/hooks/use-organization";

export default function AdminDashboard() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <PageLoading />;
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Access Denied
          </h1>
          <p className="text-muted-foreground">
            Please sign in to access the admin dashboard.
          </p>
        </div>
      </div>
    );
  }

  return <DashboardContent session={session} />;
}

function DashboardContent({ session }) {
  const { data: organizationData, isLoading, error } = useOrganization();
  const stats = useOrganizationStats(organizationData);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <MainHeader />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <PageLoading />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <MainHeader />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Error Loading Organization
            </h2>
            <p className="text-muted-foreground">
              {error.message || "Failed to load organization data"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MainHeader />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back, {session?.user?.name || "Admin"}!
              </h1>
              <p className="text-muted-foreground">
                {organizationData
                  ? "Here's what's happening with your business today."
                  : "Complete your organization setup to get started."}
              </p>
            </div>
          </div>

          {organizationData && (
            <OrganizationInfoCard organization={organizationData} stats={stats} />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Orders
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">No orders today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$0.00</div>
              <p className="text-xs text-muted-foreground">No sales today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                No items added yet
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Staff</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">Just you for now</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                No orders yet. Start taking orders to see them here!
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>• Add menu items to get started</p>
                <p>• Set up your restaurant information</p>
                <p>• Configure payment methods</p>
                <p>• Invite staff members</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
