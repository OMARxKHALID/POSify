"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { toast } from "sonner";
import { getAuthErrorMessages } from "@/lib/helpers/error-messages";
import { getRedirectPath } from "@/lib/helpers/auth-redirects";
import { loginSchema } from "@/schemas/auth-schema";
import { Lock, Mail } from "lucide-react";
import { PageLoading } from "@/components/ui/loading";
import MainHeader from "@/components/dashboard/dashboard-header";
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
      toast.error(getAuthErrorMessages(error));
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
        toast.error(getAuthErrorMessages(result.error));
      } else if (result?.ok) {
        toast.success("Login successful! Redirecting...");
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Form field components for better readability
  const EmailField = () => (
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium text-foreground">
            Email Address
          </FormLabel>
          <FormControl>
            <div className="relative">
              <Mail className="absolute w-4 h-4 text-muted-foreground transform -translate-y-1/2 left-3 top-1/2" />
              <Input
                type="email"
                placeholder="admin@example.com"
                className="pl-10 h-11"
                {...field}
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const PasswordField = () => (
    <FormField
      control={form.control}
      name="password"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium text-foreground">
            Password
          </FormLabel>
          <FormControl>
            <div className="relative">
              <Lock className="absolute w-4 h-4 text-muted-foreground transform -translate-y-1/2 left-3 top-1/2" />
              <Input
                type="password"
                placeholder="Enter your password"
                className="pl-10 h-11"
                {...field}
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const SubmitButton = ({ loading }) => (
    <Button
      type="submit"
      className="w-full font-medium h-11"
      disabled={loading}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-b-2 border-primary-foreground rounded-full animate-spin" />
          Signing in...
        </div>
      ) : (
        "Sign In"
      )}
    </Button>
  );

  return (
    <div className="min-h-screen bg-background">
      <MainHeader />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4 py-8">
        <Card className="bg-card border border-border shadow-sm w-full max-w-md">
          <CardHeader className="pb-4 space-y-1">
            <CardTitle className="text-xl font-semibold text-center text-card-foreground">
              Sign In
            </CardTitle>
            <p className="text-sm text-center text-muted-foreground">
              Enter your credentials to access the admin panel
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleLogin)}
                className="space-y-4"
              >
                <EmailField />
                <PasswordField />

                <SubmitButton
                  loading={loading || form.formState.isSubmitting}
                />
              </form>
            </Form>

            <div className="pt-4 text-center border-t border-border">
              <p className="text-xs text-muted-foreground">
                Secure access to restaurant management system
              </p>
            </div>
            <div className="mt-6 text-center">
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
  );
}
