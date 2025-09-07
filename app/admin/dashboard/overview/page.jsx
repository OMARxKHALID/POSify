"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { PageLoading } from "@/components/ui/loading";
import { ErrorBoundary } from "@/components/error-boundary";
import { useOrganizationOverview } from "@/hooks/use-organization";
import { getApiErrorMessages } from "@/lib/helpers/error-messages";
import {
  User,
  Building2,
  Calendar,
  Shield,
  Mail,
  Phone,
  Globe,
  MapPin,
  Crown,
  Users,
} from "lucide-react";
import { format } from "date-fns";

export default function OverviewPage() {
  const { data: overviewData, isLoading, error } = useOrganizationOverview();

  // Show loading while data is loading
  if (isLoading) {
    return <PageLoading />;
  }

  // Handle error state
  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive">Failed to load overview data</p>
            <p className="text-sm text-muted-foreground mt-2">
              {getApiErrorMessages(error.message) ||
                getApiErrorMessages("OPERATION_FAILED")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { user, organization, isOwner } = overviewData || {};

  return (
    <ErrorBoundary message="Failed to load dashboard overview. Please try refreshing the page.">
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your account and organization information.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Information Card */}
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
                      variant={
                        user?.status === "active" ? "default" : "outline"
                      }
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
                      ? format(
                          new Date(user.lastLogin),
                          "MMM dd, yyyy 'at' h:mm a"
                        )
                      : "Never"}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Permissions:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {user?.permissions?.length > 0 ? (
                      user.permissions.map((permission, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
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
                      ? format(new Date(user.createdAt), "MMM dd, yyyy")
                      : "Unknown"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Organization Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                User's Organization
                {isOwner && (
                  <Badge variant="default" className="ml-auto">
                    <Crown className="w-3 h-3 mr-1" />
                    Owner
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {organization ? (
                <>
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-xl font-semibold">
                        {organization.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        ID: {organization.id}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {organization.businessType
                          ?.replace("_", " ")
                          .toUpperCase()}
                      </Badge>
                      <Badge
                        variant={
                          organization.status === "active"
                            ? "default"
                            : "outline"
                        }
                      >
                        {organization.status}
                      </Badge>
                      {organization.onboardingCompleted && (
                        <Badge variant="secondary">Onboarded</Badge>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    {/* Business Information */}
                    {organization.information && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm text-muted-foreground">
                          Business Information
                        </h4>
                        <div className="grid grid-cols-1 gap-3">
                          {organization.information.legalName && (
                            <div className="flex items-center gap-2 text-sm">
                              <Building2 className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                Legal Name:
                              </span>
                              <span className="font-medium">
                                {organization.information.legalName}
                              </span>
                            </div>
                          )}

                          {organization.information.displayName && (
                            <div className="flex items-center gap-2 text-sm">
                              <Building2 className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                Display Name:
                              </span>
                              <span className="font-medium">
                                {organization.information.displayName}
                              </span>
                            </div>
                          )}

                          {organization.information.orgPhone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                Phone:
                              </span>
                              <span className="font-medium">
                                {organization.information.orgPhone}
                              </span>
                            </div>
                          )}

                          {organization.information.orgEmail && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                Email:
                              </span>
                              <span className="font-medium">
                                {organization.information.orgEmail}
                              </span>
                            </div>
                          )}

                          {organization.information.website && (
                            <div className="flex items-center gap-2 text-sm">
                              <Globe className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                Website:
                              </span>
                              <a
                                href={organization.information.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-primary hover:underline"
                              >
                                {organization.information.website}
                              </a>
                            </div>
                          )}

                          {organization.information.address && (
                            <div className="flex items-start gap-2 text-sm">
                              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                              <div>
                                <span className="text-muted-foreground">
                                  Address:
                                </span>
                                <div className="font-medium">
                                  {[
                                    organization.information.address.street,
                                    organization.information.address.city,
                                    organization.information.address.state,
                                    organization.information.address.postalCode,
                                    organization.information.address.country,
                                  ]
                                    .filter(Boolean)
                                    .join(", ")}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Organization Details */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-muted-foreground">
                        Organization Details
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Created:
                          </span>
                          <span className="font-medium">
                            {organization.createdAt
                              ? format(
                                  new Date(organization.createdAt),
                                  "MMM dd, yyyy"
                                )
                              : "Unknown"}
                          </span>
                        </div>

                        {organization.subscription && (
                          <div className="flex items-center gap-2 text-sm">
                            <Shield className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Plan:</span>
                            <Badge variant="outline">
                              {organization.subscription.plan?.toUpperCase()}
                            </Badge>
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
                        )}

                        {organization.owner && (
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Owner:
                            </span>
                            <span className="font-medium">
                              {organization.owner.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Organization</h3>
                  <p className="text-muted-foreground text-sm">
                    {user?.role === "super_admin"
                      ? "Super admins don't belong to any organization"
                      : "You haven't been assigned to an organization yet"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ErrorBoundary>
  );
}
