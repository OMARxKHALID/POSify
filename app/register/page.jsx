"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormField } from "@/components/form/form-field";
import { userRegistrationSchema } from "@/schemas/auth-schema";
import { User, Mail, Lock } from "lucide-react";
import Link from "next/link";
import { useRegistration } from "@/hooks/use-registration";
import { GeometricBackground } from "@/components/ui/geometric-background";

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
        router.push("/organization/register");
      }
    } catch {
      // Error handled inside hook via toast
    }
  }

  return (
    <div className="min-h-screen bg-background relative">
      <GeometricBackground />

      {/* Decorative glowing shapes */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      {/* Back to Home */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-30 flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors duration-200"
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
          <Card className="bg-card border border-border shadow-sm">
            <CardHeader className="space-y-2">
              <CardTitle className="text-lg font-semibold text-center">
                Create Account
              </CardTitle>
              <p className="text-sm text-center text-muted-foreground">
                Register your restaurant to get started
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
                        <div className="w-4 h-4 border-b-2 border-primary-foreground rounded-full animate-spin" />
                        Creating account...
                      </div>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </Form>

              <div className="pt-4 text-center border-t border-border">
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
