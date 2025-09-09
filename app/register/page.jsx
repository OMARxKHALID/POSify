"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormField } from "@/components/dashboard/form-field";
import { userRegistrationSchema } from "@/schemas/auth-schema";
import { User, Mail, Lock } from "lucide-react";
import Link from "next/link";
import { useRegistration } from "@/hooks/use-registration";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export default function RegisterPage() {
  const userRegistrationMutation = useRegistration();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(userRegistrationSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(data) {
    try {
      const result = await userRegistrationMutation.mutateAsync(data);

      if (result) {
        // Success toast is handled by the hook
        router.push("/organization/register");
      }
    } catch (error) {
      // Error handling is already done in the hook with toast notifications
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4 py-8">
        <div className="w-full max-w-md mx-auto">
          <Card className="bg-card border border-border shadow-sm w-full">
            <CardHeader className="pb-4 space-y-2">
              <CardTitle className="text-lg font-semibold text-center text-card-foreground">
                Register
              </CardTitle>
              <p className="text-sm text-center text-muted-foreground">
                Create your restaurant account to get started
              </p>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    label="Full Name"
                    icon={User}
                    type="text"
                    placeholder="John Doe"
                    iconPosition="input"
                    className="h-11"
                    disabled={userRegistrationMutation.isPending}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    label="Email Address"
                    icon={Mail}
                    type="email"
                    placeholder="john@example.com"
                    iconPosition="input"
                    className="h-11"
                    disabled={userRegistrationMutation.isPending}
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
                    disabled={userRegistrationMutation.isPending}
                  />

                  <Button
                    type="submit"
                    className="w-full font-medium h-11"
                    disabled={userRegistrationMutation.isPending}
                  >
                    {userRegistrationMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-b-2 border-primary-foreground rounded-full animate-spin"></div>
                        Creating account...
                      </div>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </Form>

              <div className="pt-4 text-center border-t border-border">
                <p className="text-sm text-muted-foreground mb-4">
                  By creating an account, you agree to our terms of service
                </p>
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link
                    href="/admin/login"
                    className="text-primary hover:underline"
                  >
                    Sign in here
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
