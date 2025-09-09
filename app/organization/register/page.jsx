"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
import { FormField } from "@/components/dashboard/form-field";
import { organizationRegisterSchema } from "@/schemas/organization-schema";
import { BUSINESS_TYPES } from "@/constants";
import { Store, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRegistration } from "@/hooks/use-registration";
import { REGISTRATION_TYPES } from "@/constants";
import { PageLoading } from "@/components/ui/loading";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Logo } from "@/components/ui/logo";
import { sessionUtils } from "@/lib/hooks/hook-utils";

export default function OrganizationRegisterPage() {
  const { data: session, status } = useSession();
  const organizationRegistrationMutation = useRegistration(
    REGISTRATION_TYPES.ORGANIZATION
  );
  const router = useRouter();

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

  // Update userId when session is available
  useEffect(() => {
    if (session?.user?.id) {
      form.setValue("userId", session.user.id);
    }
  }, [session?.user?.id, form]);

  // Handle redirect for unauthenticated users
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  // While session is loading, block UI
  if (status === "loading") {
    return <PageLoading />;
  }

  // If not authenticated, show loading while redirecting
  if (status === "unauthenticated") {
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

  async function onSubmit(data) {
    try {
      // Include userId from session
      const formData = {
        ...data,
        userId: session.user.id,
      };

      const result = await organizationRegistrationMutation.mutateAsync(
        formData
      );

      if (result) {
        // Handle session refresh at page level (following existing pattern)
        if (result.sessionRefresh) {
          await sessionUtils.handleSessionRefresh(updateSession, {
            data: result,
          });
        }

        router.push("/admin/dashboard");
      }
    } catch (error) {
      // Error handling is already done in the hook with toast notifications
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4 py-8">
        <div className="w-full max-w-2xl mx-auto">
          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 mb-3 bg-primary/10 rounded-lg shadow-sm">
              <Logo className="w-6 h-6" />
            </div>
            <h1 className="mb-2 text-xl font-semibold text-foreground">
              POSIFY
            </h1>
            <p className="text-sm text-muted-foreground">
              Create your organization
            </p>
          </div>

          <Card className="bg-card border border-border shadow-sm w-full">
            <CardHeader className="pb-4 space-y-2">
              <CardTitle className="text-lg font-semibold text-center text-card-foreground">
                Register Organization
              </CardTitle>
              <p className="text-sm text-center text-muted-foreground">
                Set up your restaurant or business to get started
              </p>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-3"
                >
                  {/* Main Organization Fields */}
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
                      disabled={organizationRegistrationMutation.isPending}
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
                      disabled={organizationRegistrationMutation.isPending}
                    />
                  </div>

                  {/* Additional Information Section */}
                  <div className="pt-4 border-t border-border">
                    <h3 className="text-sm font-medium text-foreground mb-4">
                      Additional Information (Optional)
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                      <ReactHookFormField
                        control={form.control}
                        name="information.legalName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium text-muted-foreground">
                              Legal Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="Legal business name"
                                className="h-10"
                                disabled={
                                  organizationRegistrationMutation.isPending
                                }
                                {...field}
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
                            <FormLabel className="text-xs font-medium text-muted-foreground">
                              Display Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="Display name for customers"
                                className="h-10"
                                disabled={
                                  organizationRegistrationMutation.isPending
                                }
                                {...field}
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
                            <FormLabel className="text-xs font-medium text-muted-foreground">
                              Phone
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="tel"
                                placeholder="+1 (555) 123-4567"
                                className="h-10"
                                disabled={
                                  organizationRegistrationMutation.isPending
                                }
                                {...field}
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
                            <FormLabel className="text-xs font-medium text-muted-foreground">
                              Business Email
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="business@example.com"
                                className="h-10"
                                disabled={
                                  organizationRegistrationMutation.isPending
                                }
                                {...field}
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
                            <FormLabel className="text-xs font-medium text-muted-foreground">
                              Website
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="url"
                                placeholder="https://myrestaurant.com"
                                className="h-10"
                                disabled={
                                  organizationRegistrationMutation.isPending
                                }
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full font-medium h-11"
                    disabled={organizationRegistrationMutation.isPending}
                  >
                    {organizationRegistrationMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-b-2 border-primary-foreground rounded-full animate-spin"></div>
                        Creating organization...
                      </div>
                    ) : (
                      "Create Organization"
                    )}
                  </Button>
                </form>
              </Form>

              <div className="pt-4 text-center border-t border-border">
                <p className="text-sm text-muted-foreground mb-4">
                  Your organization will be set up with a free trial
                </p>
                <p className="text-sm text-muted-foreground">
                  <Link
                    href="/admin/login"
                    className="inline-flex items-center text-primary hover:underline"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to login
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
