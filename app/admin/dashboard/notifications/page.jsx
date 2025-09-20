"use client";

import { Bell, Settings, Filter, Search, Plus } from "lucide-react";
import { PageLayout } from "@/components/dashboard/page-layout";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotificationsPage() {
  return (
    <PageLayout>
      <PageHeader
        title="Notifications"
        description="Manage system notifications and alerts"
        icon={Bell}
      />

      <div className="space-y-6">
        {/* Quick Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                className="pl-8 w-64"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Notification
            </Button>
          </div>
        </div>

        {/* Notifications Content */}
        <Card>
          <CardHeader>
            <CardTitle>System Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No notifications yet
              </h3>
              <p className="text-muted-foreground mb-4">
                System notifications and alerts will appear here.
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create First Notification
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
