"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageLayout } from "@/features/dashboard/components/page-layout";
import { PageHeader } from "@/features/dashboard/components/page-header";
import { useOrganizationOverview } from "@/features/organization/hooks/use-organization";
import { format } from "date-fns";
import {
  Building2,
  Calendar,
  Globe,
  Mail,
  MapPin,
  Phone,
  Shield,
  Users,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";


export default function OrganizationPage() {
  const { data: overviewData, isLoading, error } = useOrganizationOverview();
  const { organization, isOwner } = overviewData || {};

  return (
    <PageLayout
      isLoading={isLoading}
      error={error}
      errorMessage="Failed to load organization profile. Please try refreshing the page."
    >
      <PageHeader
        title="Organization Profile"
        description="Manage your business information and subscription details"
        icon={Building2}
      />

      <div className="space-y-6">
        {organization ? (
          <>

            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl flex items-center gap-2">
                      {organization.name}
                      {isOwner && (
                        <Badge variant="default" className="ml-2">
                          <Crown className="w-3 h-3 mr-1" />
                          Owner
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>ID: {organization.id}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      {organization.businessType
                        ?.replace("_", " ")
                        .toUpperCase()}
                    </Badge>
                    <Badge
                      variant={
                        organization.status === "active" ? "default" : "outline"
                      }
                    >
                      {organization.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                      Contact Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="w-4 h-4 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="font-medium">
                            {organization.information?.orgEmail ||
                              "Not provided"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="w-4 h-4 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Phone</p>
                          <p className="font-medium">
                            {organization.information?.orgPhone ||
                              "Not provided"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Globe className="w-4 h-4 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Website
                          </p>
                          {organization.information?.website ? (
                            <a
                              href={organization.information.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-primary hover:underline"
                            >
                              {organization.information.website}
                            </a>
                          ) : (
                            <p className="font-medium">Not provided</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>


                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                      Business Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Building2 className="w-4 h-4 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Legal Name
                          </p>
                          <p className="font-medium">
                            {organization.information?.legalName ||
                              organization.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="w-4 h-4 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Joined At
                          </p>
                          <p className="font-medium">
                            {organization.createdAt
                              ? format(
                                  new Date(organization.createdAt),
                                  "MMMM dd, yyyy",
                                )
                              : "Unknown"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Users className="w-4 h-4 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Owner</p>
                          <p className="font-medium">
                            {organization.owner?.name || "Unknown"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>


                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                      Location
                    </h3>
                    <div className="flex items-start gap-3 text-sm">
                      <MapPin className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Address</p>
                        {organization.information?.address ? (
                          <div className="font-medium">
                            <p>{organization.information.address.street}</p>
                            <p>
                              {organization.information.address.city},{" "}
                              {organization.information.address.state}
                            </p>
                            <p>
                              {organization.information.address.postalCode},{" "}
                              {organization.information.address.country}
                            </p>
                          </div>
                        ) : (
                          <p className="font-medium italic">
                            No address provided
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>


            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Subscription & Billing
                </CardTitle>
              </CardHeader>
              <CardContent>
                {organization.subscription ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-muted/50 border">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-lg">
                          {organization.subscription.plan?.toUpperCase()} Plan
                        </p>
                        <Badge
                          variant={
                            organization.subscription.status === "active"
                              ? "default"
                              : "outline"
                          }
                        >
                          {organization.subscription.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Your organization is currently on the{" "}
                        {organization.subscription.plan} tier.
                      </p>
                    </div>
                    <Button variant="outline">Manage Subscription</Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">
                      No active subscription plan found.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="text-center py-20 bg-card rounded-xl border border-dashed">
            <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">Organization Not Found</h3>
            <p className="text-muted-foreground">
              We couldn't retrieve your organization data. Please contact
              support.
            </p>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
