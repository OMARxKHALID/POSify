"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { PageLayout } from "@/features/dashboard/components/page-layout";
import { PageHeader } from "@/features/dashboard/components/page-header";
import { useSuspenseOrganizationOverview } from "@/features/organization/hooks/use-organization";
import { format } from "date-fns";
import { safeFormatDate, safeFormatDateTime } from "@/lib/utils/date.utils";
import { Suspense } from "react";
import { PageLoading } from "@/components/ui/loading";
import { User, Calendar, Shield, Mail, Crown, TrendingUp } from "lucide-react";

import { useSession } from "@/lib/mock-auth";

function OverviewContent() {
  const { data: overviewData } = useSuspenseOrganizationOverview();
  const { data: session } = useSession();
  const user = session?.user;
  const { organization, isOwner } = overviewData || {};

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Logged-in User
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user?.profileImage} />
              <AvatarFallback className="text-lg">
                {user?.name?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h3 className="text-xl font-semibold">{user?.name}</h3>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    user?.role === "super_admin" ? "default" : "secondary"
                  }
                >
                  {user?.role === "super_admin" && (
                    <Crown className="w-3 h-3 mr-1" />
                  )}
                  {user?.role?.replace("_", " ").toUpperCase()}
                </Badge>
                <Badge
                  variant={user?.status === "active" ? "default" : "outline"}
                >
                  {user?.status}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Email:</span>
              </div>
              <p className="font-medium">{user?.email}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Last Login:</span>
              </div>
              <p className="font-medium">
                {user?.lastLogin
                  ? safeFormatDateTime(user.lastLogin)
                  : "Never"}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Permissions:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {user?.role === "super_admin" ? (
                  <Badge variant="default" className="text-xs">
                    Full Access
                  </Badge>
                ) : user?.permissions?.length > 0 ? (
                  user.permissions.map((permission, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {permission}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">
                    No specific permissions
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Member Since:</span>
              </div>
              <p className="font-medium">
                {user?.createdAt
                  ? safeFormatDate(user.createdAt)
                  : "Unknown"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Quick Stats (Last 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Total Orders
              </p>
              <p className="text-2xl font-bold">128</p>
            </div>
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Revenue
              </p>
              <p className="text-2xl font-bold">$4,250.75</p>
            </div>
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Avg. Order
              </p>
              <p className="text-2xl font-bold">$33.20</p>
            </div>
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Best Seller
              </p>
              <p className="text-lg font-bold truncate">Grilled Chicken</p>
            </div>
          </div>
          <div className="mt-6">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/admin/dashboard/analytics">View Full Analytics</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function OverviewPage() {
  return (
    <PageLayout>
      <PageHeader
        title="Dashboard Overview"
        description="Welcome back! Here's your account and organization information."
      />
      <Suspense fallback={<PageLoading />}>
        <OverviewContent />
      </Suspense>
    </PageLayout>
  );
}
