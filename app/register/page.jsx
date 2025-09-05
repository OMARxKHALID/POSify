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
        router.push("/admin/login");
      }
    } catch (error) {
      console.error("Registration error:", error);
      // Error handling is already done in the hook with toast notifications
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
          <p className="text-sm text-gray-600">Create your account</p>
        </div>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-4 space-y-1">
            <CardTitle className="text-xl font-semibold text-center text-gray-900">
              Register
            </CardTitle>
            <p className="text-sm text-center text-gray-600">
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
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Full Name
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                          <Input
                            type="text"
                            placeholder="John Doe"
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
                            placeholder="john@example.com"
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
                      Creating account...
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </Form>

            <div className="pt-4 text-center border-t border-gray-200">
              <p className="text-xs text-gray-500">
                By creating an account, you agree to our terms of service
              </p>
            </div>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/admin/login"
                  className="text-blue-600 hover:underline"
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
