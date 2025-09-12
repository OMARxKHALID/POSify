"use client";

import { useEffect, useRef, useState } from "react";
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
import { signOut, useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { OwnershipTransferDialog } from "@/components/ui/ownership-transfer-dialog";
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
import { FormActions } from "@/components/form/form-actions";
import { FormField } from "@/components/form/form-field";
import { useEditUser, useUsers } from "@/hooks/use-users";
import { useOwnershipTransfer } from "@/hooks/use-organization";
import {
  getStatusBadgeVariant,
  getStatusIcon,
  getUserInitials,
} from "@/lib/utils/ui-utils";
import {
  canEditUser,
  canChangeRole,
  canChangeStatus,
} from "@/lib/utils/user-utils";

export default function EditUserPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams?.get("id") || null;
  const { update } = useSession?.() || {}; // guard in case useSession shape differs

  const editUserMutation = useEditUser();
  const { data: usersData, isLoading: usersLoading } = useUsers();
  const ownershipTransferMutation = useOwnershipTransfer();

  // Local UI state
  const [showOwnershipDialog, setShowOwnershipDialog] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isUpdatingSession, setIsUpdatingSession] = useState(false);

  // Refs for timers so we can clear them reliably
  const countdownIntervalRef = useRef(null);
  const timeoutRef = useRef(null);

  const users = usersData?.users || [];
  const currentUser = usersData?.currentUser;
  const targetUser = users.find((u) => u.id === userId) || null;

  // Form setup
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

  useEffect(() => {
    if (targetUser) {
      form.reset({
        name: targetUser.name ?? "",
        email: targetUser.email ?? "",
        password: "",
        role: targetUser.role ?? "staff",
        status: targetUser.status ?? "active",
        permissions: targetUser.permissions ?? [],
      });
    }
    // only reset when targetUser changes
  }, [targetUser, form]);

  const isMutating =
    editUserMutation?.isLoading ||
    editUserMutation?.isPending ||
    ownershipTransferMutation?.isLoading ||
    ownershipTransferMutation?.isPending;

  // Permission checks
  const isCurrentUser = currentUser?.id === userId;
  const canEdit = canEditUser(currentUser, targetUser);
  const userCanChangeRole = canChangeRole(currentUser, targetUser);
  const userCanChangeStatus = canChangeStatus(currentUser, targetUser);

  // Redirect if not allowed to edit (when not loading)
  useEffect(() => {
    if (!usersLoading && !canEdit) {
      router.push(ADMIN_ROUTES.USERS);
    }
  }, [canEdit, router, usersLoading]);

  // Handle form submit
  const onSubmit = async (data) => {
    try {
      // clone payload so we don't mutate RHF internals
      const payload = { ...data };

      // Remove empty password
      if (!payload.password || String(payload.password).trim() === "") {
        delete payload.password;
      }

      // Determine ownership transfer: current user is admin and promoting staff -> admin
      const isOwnershipTransfer =
        currentUser?.role === "admin" &&
        targetUser?.role === "staff" &&
        payload.role === "admin";

      if (isOwnershipTransfer) {
        setPendingFormData(payload);
        setShowOwnershipDialog(true);
        return;
      }

      // Normal submission
      await submitFormData(payload);
    } catch (err) {
      // Hook-level toasts / error handling expected in hooks
      // Make sure to not leave pending state
      setPendingFormData(null);
    }
  };

  const submitFormData = async (data) => {
    try {
      await editUserMutation.mutateAsync({
        userId,
        userData: data,
      });
      // On success, navigate back to users list
      router.push(ADMIN_ROUTES.USERS);
    } catch (error) {
      // Hook-level toasts expected
    }
  };

  // Confirm ownership transfer
  const handleOwnershipTransferConfirm = async () => {
    if (!pendingFormData || !targetUser || !currentUser) {
      setPendingFormData(null);
      setShowOwnershipDialog(false);
      return;
    }

    try {
      const result = await ownershipTransferMutation.mutateAsync({
        organizationId: currentUser.organizationId,
        newOwnerId: targetUser.id,
      });

      if (result?.ownershipTransferred) {
        // Attempt to update session (if available)
        setIsUpdatingSession(true);
        try {
          if (typeof update === "function") {
            await update();
          }
          // Give a short moment for session to stabilize
          await new Promise((r) => setTimeout(r, 700));
        } catch (sessionErr) {
          // Ignore and continue with logout flow
        } finally {
          setIsUpdatingSession(false);
        }

        // Close dialog and start logout countdown
        setShowOwnershipDialog(false);
        setIsLoggingOut(true);
        setCountdown(5);

        // Start interval to decrement countdown every second
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
        }
        countdownIntervalRef.current = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              // Clear interval once it reaches 0 in next tick
              if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
                countdownIntervalRef.current = null;
              }
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        // After 5 seconds, sign out and redirect
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(async () => {
          // Ensure interval cleared
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          try {
            await signOut({ redirect: false });
            router.push("/admin/login");
          } catch (logoutErr) {
            router.push("/admin/login");
          }
        }, 5000);
      }
    } catch (err) {
      // Hook level handles toasts/errors
    } finally {
      setPendingFormData(null);
    }
  };

  const handleOwnershipTransferCancel = () => {
    setShowOwnershipDialog(false);
    setPendingFormData(null);
  };

  // Clear timers on unmount to avoid leaks
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  // If data loading or no edit permission -> show loading page
  if (usersLoading || !canEdit) {
    return (
      <PageLayout isLoading={true} errorMessage="Loading user edit form..." />
    );
  }

  // If targetUser doesn't exist (but we have permission) -> show not found
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

  // Show a blocking UI when we're explicitly updating session
  if (isUpdatingSession) {
    return (
      <PageLayout errorMessage="Failed to load user edit form. Please try refreshing the page.">
        <PageHeader
          title="Edit User"
          description="Update user information and permissions"
          icon={Edit}
          showBackButton={true}
          onBackClick={() => router.back()}
        />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Updating session...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Calculate role options in a clearer way
  const computeRoleOptions = () => {
    // If editing your own account, don't allow role change
    if (isCurrentUser) return null;

    const currentRole = currentUser?.role;
    const targetRole = targetUser?.role;

    // Super admin can set admin or staff (and keep super_admin option if needed)
    if (currentRole === "super_admin") {
      return [
        { value: "staff", label: "Staff" },
        { value: "admin", label: "Admin" },
        // optionally allow super_admin
        // { value: "super_admin", label: "Super Admin" },
      ];
    }

    // Admin can promote staff to admin, but cannot edit other admins
    if (currentRole === "admin") {
      // If target is staff, allow promoting to admin; otherwise show only staff (no change)
      if (targetRole === "staff") {
        return [
          { value: "staff", label: "Staff" },
          { value: "admin", label: "Admin" },
        ];
      }
      return [{ value: "staff", label: "Staff" }];
    }

    // Default fallback: only staff
    return [{ value: "staff", label: "Staff" }];
  };

  const roleOptions = computeRoleOptions();

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
              {targetUser.profileImage ? (
                <AvatarImage
                  src={targetUser.profileImage}
                  alt={targetUser.name}
                />
              ) : (
                <AvatarFallback className="text-lg">
                  {getUserInitials(targetUser.name)}
                </AvatarFallback>
              )}
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
                  {String(targetUser.role).replace("_", " ")}
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
                    disabled={isMutating}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    label="Email Address"
                    icon={Mail}
                    type="email"
                    placeholder="Enter email address"
                    className="h-11"
                    disabled={isMutating}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    label="New Password"
                    icon={Lock}
                    type="password"
                    placeholder="Leave blank to keep current password"
                    className="h-11"
                    disabled={isMutating}
                  />

                  {userCanChangeRole && roleOptions && (
                    <FormField
                      control={form.control}
                      name="role"
                      label="Role"
                      icon={Shield}
                      placeholder="Select user role"
                      className="h-11"
                      disabled={isMutating}
                      options={roleOptions}
                    />
                  )}

                  {userCanChangeStatus && !isCurrentUser && (
                    <FormField
                      control={form.control}
                      name="status"
                      label="Status"
                      icon={UserCheck}
                      placeholder="Select user status"
                      className="h-11"
                      disabled={isMutating}
                      options={[
                        { value: "active", label: "Active" },
                        { value: "inactive", label: "Inactive" },
                        { value: "suspended", label: "Suspended" },
                      ]}
                    />
                  )}

                  <FormActions
                    isLoading={isMutating}
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
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground flex-shrink-0">
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
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground flex-shrink-0">
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
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground flex-shrink-0">
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
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground flex-shrink-0">
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
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground flex-shrink-0">
                  <CheckCircle className="h-3 w-3" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Leave password field blank to keep current password
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground flex-shrink-0">
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

      {/* Ownership Transfer Dialog */}
      <OwnershipTransferDialog
        isOpen={showOwnershipDialog}
        onClose={handleOwnershipTransferCancel}
        onConfirm={handleOwnershipTransferConfirm}
        targetUserName={targetUser?.name}
        isLoading={
          ownershipTransferMutation?.isLoading ||
          ownershipTransferMutation?.isPending
        }
      />

      {/* Logout Loading Overlay */}
      {isLoggingOut && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card border rounded-lg p-8 max-w-md mx-4 text-center shadow-lg">
            <div className="flex flex-col items-center space-y-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-green-600 dark:text-green-400">
                  Ownership Transferred Successfully!
                </h3>
                <p className="text-sm text-muted-foreground">
                  You are being logged out automatically in{" "}
                  <span className="font-semibold text-foreground">
                    {countdown}
                  </span>{" "}
                  {countdown === 1 ? "second" : "seconds"}
                </p>
              </div>
              <div className="w-full space-y-2">
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-1000 ease-linear"
                    style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Please wait while we log you out...
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
