"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { organizationRegisterSchema } from "@/schemas/organization-schema";
import { BUSINESS_TYPES } from "@/constants";
import { Building2, Store, ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  useRegistration,
  REGISTRATION_TYPES,
} from "@/hooks/auth/use-registration";
import { PageLoading } from "@/components/ui/loading";
import MainHeader from "@/components/main-header";

export default function OrganizationRegisterPage() {
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();
  const { mutateAsync } = useRegistration(REGISTRATION_TYPES.ORGANIZATION);
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
      loading={loading}
      setLoading={setLoading}
      mutateAsync={mutateAsync}
      router={router}
      form={form}
    />
  );
}

function OrganizationForm({
  session,
  loading,
  setLoading,
  mutateAsync,
  router,
  form,
}) {
  async function onSubmit(data) {
    setLoading(true);

    try {
      // Include userId from session
      const formData = {
        ...data,
        userId: session.user.id,
      };

      const result = await mutateAsync(formData);

      if (result) {
        // Success toast is handled by the hook
        router.push("/admin/dashboard");
      }
    } catch (error) {
      console.error("Organization registration error:", error);
      // Error handling is already done in the hook with toast notifications
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <MainHeader />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4 py-8">
        <div className="w-full max-w-2xl mx-auto">
          <div className="mb-4 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 mb-2 bg-primary rounded-lg shadow-sm">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="mb-1 text-lg font-semibold text-foreground">
              POSIFY
            </h1>
            <p className="text-xs text-muted-foreground">
              Create your organization
            </p>
          </div>

          <Card className="bg-card border border-border shadow-sm w-full">
            <CardHeader className="pb-2 space-y-1">
              <CardTitle className="text-base font-semibold text-center text-card-foreground">
                Register Organization
              </CardTitle>
              <p className="text-xs text-center text-muted-foreground">
                Set up your restaurant or business to get started
              </p>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-3"
                >
                  {/* Main Organization Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="organizationName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-foreground">
                            Organization Name *
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Store className="absolute w-4 h-4 text-muted-foreground transform -translate-y-1/2 left-3 top-1/2" />
                              <Input
                                type="text"
                                placeholder="My Restaurant"
                                className="pl-10 h-10"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="businessType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-foreground">
                            Business Type *
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select business type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {BUSINESS_TYPES.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type.charAt(0).toUpperCase() +
                                    type.slice(1).replace("-", " ")}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Additional Information Section */}
                  <div className="pt-2 border-t border-border">
                    <h3 className="text-sm font-medium text-foreground mb-2">
                      Additional Information (Optional)
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                      <FormField
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
                                className="h-9"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
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
                                className="h-9"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
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
                                className="h-9"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
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
                                className="h-9"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
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
                                className="h-9"
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
                    className="w-full font-medium h-10"
                    disabled={loading || form.formState.isSubmitting}
                  >
                    {loading || form.formState.isSubmitting ? (
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

              <div className="pt-3 text-center border-t border-border">
                <p className="text-xs text-muted-foreground mb-3">
                  Your organization will be set up with a free trial
                </p>
                <Link
                  href="/admin/login"
                  className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-3 h-3 mr-1" />
                  Back to login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
