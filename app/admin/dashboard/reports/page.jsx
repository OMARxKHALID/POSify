"use client";

import { TrendingUp } from "lucide-react";
import { PageLayout } from "@/components/dashboard/page-layout";
import { PageHeader } from "@/components/dashboard/page-header";

export default function ReportsPage() {
  return (
    <PageLayout>
      <PageHeader
        title="Reports"
        description="View and generate detailed business reports."
        icon={TrendingUp}
      />
      <div className="flex items-center justify-center h-64 border rounded-lg bg-card mt-6">
        <div className="text-center">
          <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold">Reports Module Coming Soon</h2>
          <p className="text-sm text-muted-foreground max-w-sm mt-2">
            Detailed financial and operational reports are currently in development.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
