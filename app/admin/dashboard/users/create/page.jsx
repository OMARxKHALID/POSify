"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userCreationSchema } from "@/schemas/auth-schema";
import {
  ArrowLeft,
  UserPlus,
  Shield,
  Mail,
  Lock,
  User,
  CheckCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { PageLoading } from "@/components/ui/loading";
import { ErrorBoundary } from "@/components/error-boundary";
import { useCreateUser, useUsers } from "@/hooks/use-users";
import { canCreateUsers } from "@/lib/utils/user-utils";

export default function CreateUserPage() {
  const router = useRouter();
  const createUserMutation = useCreateUser();
  const { data: usersData, isLoading: usersLoading } = useUsers();

  const currentUser = usersData?.currentUser;
  const userCanCreate = canCreateUsers(currentUser);

  // Initialize form with validation
  const form = useForm({
    resolver: zodResolver(userCreationSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "staff",
      permissions: [],
    },
  });

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      await createUserMutation.mutateAsync(data);
      router.push("/admin/dashboard/users");
    } catch (error) {
      console.error("Failed to create user:", error);
    }
  };

  // Redirect if user doesn't have permission
  useEffect(() => {
    if (!usersLoading && !userCanCreate) {
      router.push("/admin/dashboard/users");
    }
  }, [userCanCreate, router, usersLoading]);

  // Show loading while checking permissions
  if (usersLoading) {
    return <PageLoading />;
  }

  if (!userCanCreate) {
    return <PageLoading />;
  }

  return (
    <ErrorBoundary message="Failed to load user creation form. Please try refreshing the page.">
      <div className="min-h-screen w-full max-w-full overflow-x-hidden space-y-4 p-4 sm:space-y-6 sm:p-6">
        {/* Page Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                Create New User
              </h1>
              <p className="text-sm text-muted-foreground sm:text-base">
                Add a new user to your organization
              </p>
            </div>
          </div>
        </div>

        {/* Create User Form */}
        <div className="grid gap-4 lg:gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  User Information
                </CardTitle>
                <CardDescription>
                  Enter the basic information for the new user
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    {/* Name Field */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Full Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter full name"
                              {...field}
                              disabled={createUserMutation.isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Email Field */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Email Address
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Enter email address"
                              {...field}
                              disabled={createUserMutation.isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Password Field */}
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            Password
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter password (min 6 characters)"
                              {...field}
                              disabled={createUserMutation.isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Role Field */}
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Role
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={createUserMutation.isPending}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select user role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="staff">Staff</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Form Actions */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end pt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={createUserMutation.isPending}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createUserMutation.isPending}
                        className="flex items-center gap-2"
                      >
                        {createUserMutation.isPending ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Creating User...
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4" />
                            Create User
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 lg:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Role Permissions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 flex-shrink-0">
                      <User className="h-3 w-3" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm text-foreground">
                        Staff
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Dashboard access, order management, POS access
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Quick Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600 flex-shrink-0">
                    <CheckCircle className="h-3 w-3" />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    User will be automatically linked to your organization
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-600 flex-shrink-0">
                    <Shield className="h-3 w-3" />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Default permissions are assigned based on role
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 text-orange-600 flex-shrink-0">
                    <Mail className="h-3 w-3" />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    User will receive login credentials via email
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
