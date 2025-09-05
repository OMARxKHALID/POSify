"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, useSession } from "next-auth/react";
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
import { getAuthErrorMessage } from "@/lib/helpers/auth-errors";
import { loginSchema } from "@/schemas/auth-schema";
import { Lock, Mail, Store } from "lucide-react";
import { PageLoading } from "@/components/ui/loading";
import Link from "next/link";

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  const { status } = useSession();

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // While session is loading, block UI
  if (status === "loading") {
    return <PageLoading />;
  }

  async function onSubmit(data) {
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
        callbackUrl: "/admin/dashboard",
      });

      if (result?.error) {
        toast.error(getAuthErrorMessage(result.error));
      } else if (result?.ok) {
        toast.success("Login successful!");
        window.location.href = result.url || "/admin/dashboard";
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-blue-600 rounded-lg shadow-lg">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="mb-2 text-2xl font-semibold text-gray-900">
            Restaurant POS
          </h1>
          <p className="text-sm text-gray-600">Admin Dashboard Access</p>
        </div>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-4 space-y-1">
            <CardTitle className="text-xl font-semibold text-center text-gray-900">
              Sign In
            </CardTitle>
            <p className="text-sm text-center text-gray-600">
              Enter your credentials to access the admin panel
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                          <Input
                            type="email"
                            placeholder="admin@example.com"
                            className="pl-10 border-gray-300 h-11 focus:border-blue-500 focus:ring-blue-500"
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
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                          <Input
                            type="password"
                            placeholder="Enter your password"
                            className="pl-10 border-gray-300 h-11 focus:border-blue-500 focus:ring-blue-500"
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
                  className="w-full font-medium text-white bg-blue-600 h-11 hover:bg-blue-700"
                  disabled={loading || form.formState.isSubmitting}
                >
                  {loading || form.formState.isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-b-2 border-white rounded-full animate-spin"></div>
                      Signing in...
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </Form>

            <div className="pt-4 text-center border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Secure access to restaurant management system
              </p>
            </div>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                New restaurant owner?{" "}
                <Link
                  href="/register"
                  className="text-blue-600 hover:underline"
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
