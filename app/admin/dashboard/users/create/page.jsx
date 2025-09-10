"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userCreationSchema } from "@/schemas/auth-schema";
import { ADMIN_ROUTES } from "@/constants";
import { UserPlus, Shield, Mail, Lock, User, CheckCircle } from "lucide-react";

import { Form } from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { PageLayout } from "@/components/dashboard/page-layout";
import { PageHeader } from "@/components/dashboard/page-header";
import { FormActions } from "@/components/form/form-actions";
import { FormField } from "@/components/form/form-field";
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
      router.push(ADMIN_ROUTES.USERS);
    } catch (error) {
      // Error handling is already done in the hook with toast notifications
    }
  };

  // Redirect if user doesn't have permission
  useEffect(() => {
    if (!usersLoading && !userCanCreate) {
      router.push(ADMIN_ROUTES.USERS);
    }
  }, [userCanCreate, router, usersLoading]);

  // Show loading while checking permissions
  if (usersLoading || !userCanCreate) {
    return (
      <PageLayout
        isLoading={true}
        errorMessage="Loading user creation form..."
      />
    );
  }

  return (
    <PageLayout errorMessage="Failed to load user creation form. Please try refreshing the page.">
      <PageHeader
        title="Create New User"
        description="Add a new user to your organization"
        icon={UserPlus}
        showBackButton={true}
        onBackClick={() => router.back()}
      />

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
                  <FormField
                    control={form.control}
                    name="name"
                    label="Full Name"
                    icon={User}
                    placeholder="Enter full name"
                    className="h-11"
                    disabled={createUserMutation.isPending}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    label="Email Address"
                    icon={Mail}
                    type="email"
                    placeholder="Enter email address"
                    className="h-11"
                    disabled={createUserMutation.isPending}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    label="Password"
                    icon={Lock}
                    type="password"
                    placeholder="Enter password (min 6 characters)"
                    className="h-11"
                    disabled={createUserMutation.isPending}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    label="Role"
                    icon={Shield}
                    placeholder="Select user role"
                    className="h-11"
                    disabled={createUserMutation.isPending}
                    options={[{ value: "staff", label: "Staff" }]}
                  />

                  <FormActions
                    isLoading={createUserMutation.isPending}
                    submitText="Create User"
                    submitIcon={UserPlus}
                  />
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
                    <p className="font-medium text-sm text-foreground">Staff</p>
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
    </PageLayout>
  );
}
