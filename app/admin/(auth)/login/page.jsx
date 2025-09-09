"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormField } from "@/components/dashboard/form-field";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/helpers/error-messages";
import { getRedirectPath } from "@/lib/helpers/auth-redirects";
import { loginSchema } from "@/schemas/auth-schema";
import { Lock, Mail } from "lucide-react";
import { PageLoading } from "@/components/ui/loading";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import Link from "next/link";
import { FORM_DEFAULTS, DEFAULT_REDIRECTS, AUTH_ROUTES } from "@/constants";

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: FORM_DEFAULTS.LOGIN,
  });

  const getUserRedirectPath = (user) => {
    return getRedirectPath(
      {
        role: user.role,
        organizationId: user.organizationId,
        onboardingCompleted: user.onboardingCompleted,
      },
      AUTH_ROUTES.LOGIN
    );
  };

  // Handle URL error parameters
  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      toast.error(getErrorMessage(error));
      // Clean up URL
      const url = new URL(window.location);
      url.searchParams.delete("error");
      window.history.replaceState({}, "", url);
    }
  }, [searchParams]);

  // Redirect authenticated users
  useEffect(() => {
    if (session?.user) {
      const redirectPath = getUserRedirectPath(session.user);
      if (redirectPath && redirectPath !== AUTH_ROUTES.LOGIN) {
        router.push(redirectPath);
      } else {
        router.push(DEFAULT_REDIRECTS.FALLBACK);
      }
    }
  }, [session, router]);

  // Show loading while redirecting authenticated users
  if (session?.user) {
    return <PageLoading />;
  }

  const handleLogin = async (data) => {
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(getErrorMessage(result.error));
      } else if (result?.ok) {
        toast.success("Login successful! Redirecting...");
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4 py-8">
        <div className="w-full max-w-md mx-auto">
          <Card className="bg-card border border-border shadow-sm w-full">
            <CardHeader className="pb-4 space-y-2">
              <CardTitle className="text-lg font-semibold text-center text-card-foreground">
                Sign In
              </CardTitle>
              <p className="text-sm text-center text-muted-foreground">
                Enter your credentials to access the admin panel
              </p>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleLogin)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    label="Email Address"
                    icon={Mail}
                    type="email"
                    placeholder="admin@example.com"
                    iconPosition="input"
                    className="h-11"
                    disabled={loading}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    label="Password"
                    icon={Lock}
                    type="password"
                    placeholder="Enter your password"
                    iconPosition="input"
                    className="h-11"
                    disabled={loading}
                  />

                  <Button
                    type="submit"
                    className="w-full font-medium h-11"
                    disabled={loading || form.formState.isSubmitting}
                  >
                    {loading || form.formState.isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-b-2 border-primary-foreground rounded-full animate-spin" />
                        Signing in...
                      </div>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </Form>

              <div className="pt-4 text-center border-t border-border">
                <p className="text-sm text-muted-foreground mb-4">
                  Secure access to restaurant management system
                </p>
                <p className="text-sm text-muted-foreground">
                  New restaurant owner?{" "}
                  <Link
                    href={AUTH_ROUTES.REGISTER}
                    className="text-primary hover:underline"
                  >
                    Register your restaurant here
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
