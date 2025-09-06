"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
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
import { userRegistrationSchema } from "@/schemas/auth-schema";
import { User, Mail, Lock, Store } from "lucide-react";
import Link from "next/link";
import { useRegistration } from "@/hooks/auth/use-registration";
import MainHeader from "@/components/main-header";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const { mutateAsync } = useRegistration();
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
    setLoading(true);

    try {
      const result = await mutateAsync(data);

      if (result) {
        // Success toast is handled by the hook
        router.push("/organization/register");
      }
    } catch (error) {
      console.error("Registration error:", error);
      // Error handling is already done in the hook with toast notifications
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <MainHeader />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4 py-8">
        <Card className="bg-card border border-border shadow-sm w-full max-w-md">
          <CardHeader className="pb-4 space-y-1">
            <CardTitle className="text-xl font-semibold text-center text-card-foreground">
              Register
            </CardTitle>
            <p className="text-sm text-center text-muted-foreground">
              Create your restaurant account to get started
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground">
                        Full Name
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute w-4 h-4 text-muted-foreground transform -translate-y-1/2 left-3 top-1/2" />
                          <Input
                            type="text"
                            placeholder="John Doe"
                            className="pl-10 h-11"
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
                            placeholder="john@example.com"
                            className="pl-10 h-11"
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

                <Button
                  type="submit"
                  className="w-full font-medium h-11"
                  disabled={loading || form.formState.isSubmitting}
                >
                  {loading || form.formState.isSubmitting ? (
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
              <p className="text-xs text-muted-foreground">
                By creating an account, you agree to our terms of service
              </p>
            </div>
            <div className="mt-6 text-center">
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
  );
}
