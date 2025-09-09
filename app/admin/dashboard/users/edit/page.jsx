"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userEditSchema } from "@/schemas/auth-schema";
import { ADMIN_ROUTES } from "@/constants";
import {
  Edit,
  Shield,
  Mail,
  Lock,
  User,
  AlertTriangle,
  CheckCircle,
  UserCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form } from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageLayout } from "@/components/dashboard/page-layout";
import { PageHeader } from "@/components/dashboard/page-header";
import { FormActions } from "@/components/dashboard/form-actions";
import { FormField } from "@/components/dashboard/form-field";
import { useEditUser, useUsers } from "@/hooks/use-users";
import {
  getStatusBadgeVariant,
  getStatusIcon,
  getUserInitials,
  canEditUser,
  canChangeRole,
  canChangeStatus,
} from "@/lib/utils/user-utils";

export default function EditUserPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");

  const editUserMutation = useEditUser();
  const { data: usersData, isLoading } = useUsers();

  const users = usersData?.users || [];
  const currentUser = usersData?.currentUser;
  const targetUser = users.find((user) => user.id === userId);

  // Initialize form with validation
  const form = useForm({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "staff",
      status: "active",
      permissions: [],
    },
  });

  // Update form when targetUser data is available
  useEffect(() => {
    if (targetUser) {
      form.reset({
        name: targetUser.name,
        email: targetUser.email,
        password: "",
        role: targetUser.role,
        status: targetUser.status,
        permissions: targetUser.permissions,
      });
    }
  }, [targetUser, form]);

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      // Remove empty password field (handle both undefined and empty string)
      if (!data.password || data.password.trim() === "") {
        delete data.password;
      }

      await editUserMutation.mutateAsync({
        userId,
        userData: data,
      });
      router.push(ADMIN_ROUTES.USERS);
    } catch (error) {
      // Error handling is already done in the hook with toast notifications
    }
  };

  // Permission checks
  const isCurrentUser = currentUser?.id === userId;
  const canEdit = canEditUser(currentUser, targetUser);
  const userCanChangeRole = canChangeRole(currentUser, targetUser);
  const userCanChangeStatus = canChangeStatus(currentUser, targetUser);

  // Show loading state
  if (isLoading || !canEdit) {
    return (
      <PageLayout isLoading={true} errorMessage="Loading user edit form..." />
    );
  }

  // Show error if user not found
  if (!targetUser) {
    return (
      <PageLayout error={{ message: "User not found" }}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">User not found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              The user you're trying to edit doesn't exist or you don't have
              permission to access it.
            </p>
            <Button onClick={() => router.push(ADMIN_ROUTES.USERS)}>
              Back to Users
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Redirect if user doesn't have permission
  useEffect(() => {
    if (!isLoading && !canEdit) {
      router.push(ADMIN_ROUTES.USERS);
    }
  }, [canEdit, router, isLoading]);

  return (
    <PageLayout errorMessage="Failed to load user edit form. Please try refreshing the page.">
      <PageHeader
        title="Edit User"
        description="Update user information and permissions"
        icon={Edit}
        showBackButton={true}
        onBackClick={() => router.back()}
      />

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Current User Information
          </CardTitle>
          <CardDescription>
            Overview of the user's current details and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Avatar className="h-16 w-16 flex-shrink-0">
              <AvatarImage
                src={targetUser.profileImage}
                alt={targetUser.name}
              />
              <AvatarFallback className="text-lg">
                {getUserInitials(targetUser.name)}
              </AvatarFallback>
            </Avatar>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 min-w-0">
              <div>
                <Label className="text-sm font-medium">Name</Label>
                <p className="text-sm text-muted-foreground">
                  {targetUser.name}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-sm text-muted-foreground">
                  {targetUser.email}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Role</Label>
                <Badge variant="outline" className="capitalize">
                  {targetUser.role.replace("_", " ")}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <div className="flex items-center gap-2">
                  {getStatusIcon(targetUser.status)}
                  <Badge
                    variant={getStatusBadgeVariant(targetUser.status)}
                    className="capitalize"
                  >
                    {targetUser.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Form */}
      <div className="grid gap-4 lg:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Edit Information
              </CardTitle>
              <CardDescription>
                Update the user's details and permissions
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
                    disabled={editUserMutation.isPending}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    label="Email Address"
                    icon={Mail}
                    type="email"
                    placeholder="Enter email address"
                    className="h-11"
                    disabled={editUserMutation.isPending}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    label="New Password"
                    icon={Lock}
                    type="password"
                    placeholder="Leave blank to keep current password"
                    className="h-11"
                    disabled={editUserMutation.isPending}
                  />

                  {userCanChangeRole && (
                    <FormField
                      control={form.control}
                      name="role"
                      label="Role"
                      icon={Shield}
                      placeholder="Select user role"
                      className="h-11"
                      disabled={editUserMutation.isPending}
                      options={
                        currentUser?.role === "super_admin"
                          ? [
                              { value: "staff", label: "Staff" },
                              { value: "admin", label: "Admin" },
                            ]
                          : [{ value: "staff", label: "Staff" }]
                      }
                    />
                  )}

                  {userCanChangeStatus && (
                    <FormField
                      control={form.control}
                      name="status"
                      label="Status"
                      icon={UserCheck}
                      placeholder="Select user status"
                      className="h-11"
                      disabled={editUserMutation.isPending}
                      options={[
                        { value: "active", label: "Active" },
                        { value: "inactive", label: "Inactive" },
                        { value: "suspended", label: "Suspended" },
                      ]}
                    />
                  )}

                  <FormActions
                    isLoading={editUserMutation.isPending}
                    submitText="Update User"
                    submitIcon={Edit}
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
                Edit Permissions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isCurrentUser ? (
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 flex-shrink-0">
                    <User className="h-3 w-3" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm text-foreground">
                      Self Edit
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      You can only update your own password and basic
                      information
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600 flex-shrink-0">
                      <User className="h-3 w-3" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm text-foreground">
                        Staff Users
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Can only update their password
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-purple-600 flex-shrink-0">
                      <Shield className="h-3 w-3" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm text-foreground">
                        Admin Users
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Can edit staff users in their organization
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-orange-600 flex-shrink-0">
                      <UserCheck className="h-3 w-3" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm text-foreground">
                        Super Admin
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Can edit any user except themselves
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Password Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600 flex-shrink-0">
                  <CheckCircle className="h-3 w-3" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Leave password field blank to keep current password
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-600 flex-shrink-0">
                  <Lock className="h-3 w-3" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Minimum 6 characters required for new passwords
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
