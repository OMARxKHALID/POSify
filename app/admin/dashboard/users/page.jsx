"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  UserPlus,
  Shield,
  Mail,
  Calendar,
  Users,
  Building2,
  Settings,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";

import { DataTable } from "@/components/ui/data-table";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { PageLoading } from "@/components/ui/loading";
import { ErrorBoundary } from "@/components/error-boundary";
import { useUsersManagement } from "@/hooks/use-users";
import {
  getRoleBadgeVariant,
  getStatusBadgeVariant,
  getStatusIcon,
  getUserInitials,
  canEditUser,
  canDeleteUser,
  canCreateUsers,
} from "@/lib/utils/user-utils";

// Column helper for table
const columnHelper = createColumnHelper();

export default function UsersPage() {
  const router = useRouter();
  const {
    data: usersData,
    isLoading,
    isError,
    error,
    refetch,
    createUser,
    editUser,
    deleteUser,
  } = useUsersManagement();

  // Extract users from API response
  const users = usersData?.users || [];
  const currentUser = usersData?.currentUser;

  // Delete confirmation dialog state
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    userId: null,
    userInfo: null,
  });
  const organization = usersData?.organization;

  // Define table columns
  const columns = [
    columnHelper.accessor("name", {
      header: "User",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.profileImage} alt={user.name} />
              <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {user.email}
              </div>
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor("role", {
      header: ({ column, table }) => {
        const canFilter =
          currentUser?.role === "super_admin" || currentUser?.role === "admin";

        if (!canFilter) {
          return "Role";
        }

        return (
          <div className="flex items-center gap-2">
            <span>Role</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[150px]">
                <DropdownMenuLabel>Filter by role</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={!column.getFilterValue()}
                  onCheckedChange={() => column.setFilterValue(undefined)}
                >
                  All Roles
                </DropdownMenuCheckboxItem>
                {/* Only super_admin can see and filter by super_admin role */}
                {currentUser?.role === "super_admin" && (
                  <DropdownMenuCheckboxItem
                    checked={column.getFilterValue() === "super_admin"}
                    onCheckedChange={(checked) =>
                      column.setFilterValue(checked ? "super_admin" : undefined)
                    }
                  >
                    Super Admin
                  </DropdownMenuCheckboxItem>
                )}
                {/* Only super_admin can see and filter by admin role */}
                {currentUser?.role === "super_admin" && (
                  <DropdownMenuCheckboxItem
                    checked={column.getFilterValue() === "admin"}
                    onCheckedChange={(checked) =>
                      column.setFilterValue(checked ? "admin" : undefined)
                    }
                  >
                    Admin
                  </DropdownMenuCheckboxItem>
                )}
                <DropdownMenuCheckboxItem
                  checked={column.getFilterValue() === "staff"}
                  onCheckedChange={(checked) =>
                    column.setFilterValue(checked ? "staff" : undefined)
                  }
                >
                  Staff
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={column.getFilterValue() === "pending"}
                  onCheckedChange={(checked) =>
                    column.setFilterValue(checked ? "pending" : undefined)
                  }
                >
                  Pending
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      cell: ({ row }) => {
        const role = row.getValue("role");
        return (
          <Badge variant={getRoleBadgeVariant(role)} className="capitalize">
            <Shield className="h-3 w-3 mr-1" />
            {role.replace("_", " ")}
          </Badge>
        );
      },
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status");
        return (
          <div className="flex items-center gap-2">
            {getStatusIcon(status)}
            <Badge
              variant={getStatusBadgeVariant(status)}
              className="capitalize"
            >
              {status}
            </Badge>
          </div>
        );
      },
    }),
    columnHelper.accessor("permissions", {
      header: "Permissions",
      cell: ({ row }) => {
        const permissions = row.getValue("permissions") || [];
        return (
          <div className="text-sm text-muted-foreground">
            {permissions.length} permission{permissions.length !== 1 ? "s" : ""}
          </div>
        );
      },
    }),
    columnHelper.accessor("lastLogin", {
      header: "Last Login",
      cell: ({ row }) => {
        const lastLogin = row.getValue("lastLogin");
        return (
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {lastLogin ? format(new Date(lastLogin), "MMM dd, yyyy") : "Never"}
          </div>
        );
      },
    }),
    columnHelper.accessor("createdAt", {
      header: "Created",
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt");
        return (
          <div className="text-sm text-muted-foreground">
            {format(new Date(createdAt), "MMM dd, yyyy")}
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const user = row.original;
        const canEdit = canEditUser(currentUser, user);
        const canDelete = canDeleteUser(currentUser, user);

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {canEdit && (
                <DropdownMenuItem
                  onClick={() =>
                    router.push(`/admin/dashboard/users/edit?id=${user.id}`)
                  }
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit User
                </DropdownMenuItem>
              )}
              {canDelete && (
                <DropdownMenuItem
                  onClick={() => handleDeleteUser(user.id)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete User
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    }),
  ];

  // Handle user deletion
  const handleDeleteUser = (userId) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setDeleteDialog({
        isOpen: true,
        userId,
        userInfo: {
          name: user.name,
          email: user.email,
        },
      });
    }
  };

  // Confirm user deletion
  const confirmDeleteUser = async () => {
    if (!deleteDialog.userId) return;

    try {
      await deleteUser.mutateAsync(deleteDialog.userId);
      setDeleteDialog({ isOpen: false, userId: null, userInfo: null });
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  // Close delete dialog
  const closeDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, userId: null, userInfo: null });
  };

  // Handle create user navigation
  const handleCreateUser = () => {
    router.push("/admin/dashboard/users/create");
  };

  // Show loading state
  if (isLoading) {
    return <PageLoading />;
  }

  // Show error state
  if (isError) {
    return (
      <div className="min-h-screen w-full max-w-full overflow-x-hidden space-y-3 p-3 sm:space-y-4 sm:p-4 lg:p-6">
        <div className="mb-2">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">
            Users Management
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Error loading users data
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load users</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {error?.message || "An error occurred while loading users data"}
            </p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary message="Failed to load users management. Please try refreshing the page.">
      <div className="min-h-screen w-full max-w-full overflow-x-hidden space-y-4 p-4 sm:space-y-6 sm:p-6">
        {/* Page Header */}
        <div className="space-y-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                Users Management
              </h1>
              <p className="text-sm text-muted-foreground sm:text-base">
                Manage users, roles, and permissions for your organization
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">
                {users.filter((u) => u.status === "active").length} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter((u) => u.role === "admin").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Organization administrators
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Staff Members
              </CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter((u) => u.role === "staff").length}
              </div>
              <p className="text-xs text-muted-foreground">Team members</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter((u) => u.role === "pending").length}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>
        </div>

        {/* Organization Info (for admins) */}
        {organization && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Organization
              </CardTitle>
              <CardDescription>
                Your organization information and settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary flex-shrink-0">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{organization.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      Organization ID: {organization.id}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              All Users
            </CardTitle>
            <CardDescription>
              Manage user accounts, roles, and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={users}
              columns={columns}
              searchKey="name"
              searchPlaceholder="Search users by name or email..."
              showAddButton={canCreateUsers(currentUser)}
              addButtonText="Add New User"
              onAddClick={handleCreateUser}
            />
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={closeDeleteDialog}
        onConfirm={confirmDeleteUser}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete User"
        cancelText="Cancel"
        isLoading={deleteUser.isPending}
        userInfo={deleteDialog.userInfo}
      />
    </ErrorBoundary>
  );
}
