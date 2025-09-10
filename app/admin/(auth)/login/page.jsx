"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormField } from "@/components/form/form-field";
import { PageLoading } from "@/components/ui/loading";
import { GeometricBackground } from "@/components/ui/geometric-background";

import { toast } from "sonner";
import { getErrorMessage } from "@/lib/helpers/error-messages";
import { getRedirectPath } from "@/lib/helpers/auth-redirects";
import { loginSchema } from "@/schemas/auth-schema";
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

  const getUserRedirectPath = (user) =>
    getRedirectPath(
      {
        role: user.role,
        organizationId: user.organizationId,
        onboardingCompleted: user.onboardingCompleted,
      },
      AUTH_ROUTES.LOGIN
    );

  // Handle error messages from query params
  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      toast.error(getErrorMessage(error));
      // Remove error param from URL
      const url = new URL(window.location.href);
      url.searchParams.delete("error");
      window.history.replaceState({}, "", url);
    }
  }, [searchParams]);

  // Redirect logged-in users
  useEffect(() => {
    if (session?.user) {
      const redirectPath = getUserRedirectPath(session.user);
      router.push(redirectPath || DEFAULT_REDIRECTS.FALLBACK);
    }
  }, [session, router]);

  // While session exists → block UI with loader
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
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
        <div className="w-full max-w-md">
          <Card className="border border-border bg-card shadow-sm">
            <CardHeader className="space-y-2">
              <CardTitle className="text-lg font-semibold text-center">
                Sign In
              </CardTitle>
              <p className="text-sm text-center text-muted-foreground">
                Enter your credentials to access the admin panel
              </p>
            </CardHeader>

            <CardContent className="p-6">
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
                    className="w-full h-11 font-medium"
                    disabled={loading || form.formState.isSubmitting}
                  >
                    {loading || form.formState.isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 animate-spin rounded-full border-b-2 border-primary-foreground" />
                        Signing in...
                      </div>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </Form>

              <div className="mt-6 border-t border-border pt-4 text-center">
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
