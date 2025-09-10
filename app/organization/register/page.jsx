"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Store } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormField as ReactHookFormField,
} from "@/components/ui/form";
import { FormField } from "@/components/form/form-field";
import { organizationRegisterSchema } from "@/schemas/organization-schema";
import { BUSINESS_TYPES, REGISTRATION_TYPES } from "@/constants";
import { useRegistration } from "@/hooks/use-registration";
import { PageLoading } from "@/components/ui/loading";
import { GeometricBackground } from "@/components/ui/geometric-background";
import { sessionUtils } from "@/lib/hooks/hook-utils";

export default function OrganizationRegisterPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const organizationRegistrationMutation = useRegistration(
    REGISTRATION_TYPES.ORGANIZATION
  );

  const form = useForm({
    resolver: zodResolver(organizationRegisterSchema),
    defaultValues: {
      userId: "",
      organizationName: "",
      businessType: "restaurant",
      information: {
        legalName: "",
        displayName: "",
        orgPhone: "",
        email: "",
        website: "",
      },
    },
  });

  // Handle session changes and redirects
  useEffect(() => {
    if (!session) return;

    // Set userId from session
    if (session.user?.id) {
      form.setValue("userId", session.user.id);
    }

    // Redirect unauthenticated users
    if (status === "unauthenticated") {
      router.push("/admin/login");
      return;
    }

    // Redirect users who have completed onboarding
    if (session.user?.onboardingCompleted && session.user?.organizationId) {
      router.replace("/admin/dashboard");
    }
  }, [session, status, router, form]);

  // Show loading while session is loading, unauthenticated, or user has completed onboarding
  if (
    status === "loading" ||
    status === "unauthenticated" ||
    (session?.user?.onboardingCompleted && session?.user?.organizationId)
  ) {
    return <PageLoading />;
  }

  return (
    <OrganizationForm
      session={session}
      organizationRegistrationMutation={organizationRegistrationMutation}
      router={router}
      form={form}
    />
  );
}

function OrganizationForm({
  session,
  organizationRegistrationMutation,
  router,
  form,
}) {
  const { update: updateSession } = useSession();
  const [isRefreshingSession, setIsRefreshingSession] = useState(false);

  async function onSubmit(data) {
    try {
      const formData = { ...data, userId: session.user.id };

      const result = await organizationRegistrationMutation.mutateAsync(
        formData
      );

      if (result?.sessionRefresh) {
        setIsRefreshingSession(true);
        await sessionUtils.handleSessionRefresh(updateSession, {
          data: result,
        });
      }

      router.push("/admin/dashboard");
    } catch {
      setIsRefreshingSession(false);
      // Toast errors handled in useRegistration
    }
  }

  if (isRefreshingSession) {
    return <PageLoading />;
  }

  return (
    <div className="relative min-h-screen bg-background">
      <GeometricBackground />

      {/* Decorative blobs */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      {/* Back to Home */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-30 flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        <span>Back to Home</span>
      </Link>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-2xl">
          <Card className="border border-border bg-card shadow-sm">
            <CardHeader className="space-y-2">
              <CardTitle className="text-lg font-semibold text-center">
                Register Organization
              </CardTitle>
              <p className="text-sm text-center text-muted-foreground">
                Set up your restaurant or business to get started
              </p>
            </CardHeader>

            <CardContent className="p-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* Main Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="organizationName"
                      label="Organization Name *"
                      icon={Store}
                      type="text"
                      placeholder="My Restaurant"
                      iconPosition="input"
                      className="h-11"
                      disabled={
                        organizationRegistrationMutation.isPending ||
                        isRefreshingSession
                      }
                    />

                    <FormField
                      control={form.control}
                      name="businessType"
                      label="Business Type *"
                      placeholder="Select business type"
                      options={BUSINESS_TYPES.map((type) => ({
                        value: type,
                        label:
                          type.charAt(0).toUpperCase() +
                          type.slice(1).replace("-", " "),
                      }))}
                      className="h-11"
                      disabled={
                        organizationRegistrationMutation.isPending ||
                        isRefreshingSession
                      }
                    />
                  </div>

                  {/* Additional Information */}
                  <div>
                    <h3 className="mb-4 text-sm font-medium text-foreground">
                      Additional Information (Optional)
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <ReactHookFormField
                        control={form.control}
                        name="information.legalName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-muted-foreground">
                              Legal Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="text"
                                placeholder="Legal business name"
                                className="h-10"
                                disabled={
                                  organizationRegistrationMutation.isPending
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <ReactHookFormField
                        control={form.control}
                        name="information.displayName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-muted-foreground">
                              Display Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="text"
                                placeholder="Display name for customers"
                                className="h-10"
                                disabled={
                                  organizationRegistrationMutation.isPending
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <ReactHookFormField
                        control={form.control}
                        name="information.orgPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-muted-foreground">
                              Phone
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="tel"
                                placeholder="+1 (555) 123-4567"
                                className="h-10"
                                disabled={
                                  organizationRegistrationMutation.isPending
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <ReactHookFormField
                        control={form.control}
                        name="information.email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-muted-foreground">
                              Business Email
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                placeholder="business@example.com"
                                className="h-10"
                                disabled={
                                  organizationRegistrationMutation.isPending
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <ReactHookFormField
                        control={form.control}
                        name="information.website"
                        render={({ field }) => (
                          <FormItem className="sm:col-span-2">
                            <FormLabel className="text-xs text-muted-foreground">
                              Website
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="url"
                                placeholder="https://myrestaurant.com"
                                className="h-10"
                                disabled={
                                  organizationRegistrationMutation.isPending
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    className="w-full h-11 font-medium"
                    disabled={
                      organizationRegistrationMutation.isPending ||
                      isRefreshingSession
                    }
                  >
                    {organizationRegistrationMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 animate-spin rounded-full border-b-2 border-primary-foreground"></div>
                        Creating organization...
                      </div>
                    ) : isRefreshingSession ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 animate-spin rounded-full border-b-2 border-primary-foreground"></div>
                        Setting up your account...
                      </div>
                    ) : (
                      "Create Organization"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
