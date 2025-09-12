"use client";

import { useState, useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  Shield,
  Eye,
  User,
  Activity,
  AlertTriangle,
  TrendingUp,
  Clock,
  Users,
  FileText,
  Database,
  Settings,
  ChevronDown,
} from "lucide-react";

import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AuditChangesDisplay } from "@/components/dashboard/audit-log/audit-changes-display";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { KPICard, KPICardsGrid } from "@/components/ui/kpi-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PageLayout } from "@/components/dashboard/page-layout";
import { PageHeader } from "@/components/dashboard/page-header";
import { useAuditLogsManagement } from "@/hooks/use-audit-logs";
import {
  getActionBadgeVariant,
  getResourceBadgeVariant,
} from "@/lib/utils/audit-log-utils";
import { getRoleBadgeVariant } from "@/lib/utils/ui-utils";

// Column helper for table
const columnHelper = createColumnHelper();

export default function AuditLogsPage() {
  const {
    auditLogs,
    pagination,
    appliedFilters,
    currentUser,
    isLoading,
    isError,
    error,
    refresh,
  } = useAuditLogsManagement();

  const [tableKey, setTableKey] = useState(0);

  // Memoized stats calculations for better performance
  const stats = useMemo(() => {
    const today = new Date();
    const todayActions = auditLogs.filter((log) => {
      const logDate = new Date(log.createdAt);
      return logDate.toDateString() === today.toDateString();
    }).length;

    const uniqueUsers = new Set(auditLogs.map((log) => log.userEmail)).size;

    return {
      todayActions,
      uniqueUsers,
    };
  }, [auditLogs]);

  // Helper function to handle filter changes
  const handleFilterChange = (column, filterKey, value) => {
    column.setFilterValue(value);
  };

  // Helper function to create filter dropdown items
  const createFilterItems = (options, column, filterKey) => {
    return [
      {
        value: undefined,
        label: "All",
        checked: !column.getFilterValue(),
        onCheckedChange: () => handleFilterChange(column, filterKey, undefined),
      },
      ...options.map((option) => ({
        value: option.value,
        label: option.label,
        checked: column.getFilterValue() === option.value,
        onCheckedChange: (checked) =>
          handleFilterChange(
            column,
            filterKey,
            checked ? option.value : undefined
          ),
      })),
    ];
  };

  // Reusable filter header component
  const FilterHeader = ({
    title,
    filterValue,
    options,
    column,
    filterKey,
    displayValue,
  }) => {
    const filterItems = createFilterItems(options, column, filterKey);
    const displayText = displayValue ? displayValue(filterValue) : filterValue;

    return (
      <div className="flex items-center gap-2">
        <span>{title}</span>
        {filterValue && (
          <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
            {displayText}
          </Badge>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[150px]">
            <DropdownMenuLabel>
              Filter by {title.toLowerCase()}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {filterItems.map((item, index) => (
              <DropdownMenuCheckboxItem
                key={index}
                checked={item.checked}
                onCheckedChange={item.onCheckedChange}
              >
                {item.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  // Define table columns
  const columns = [
    columnHelper.accessor("action", {
      header: ({ column }) => {
        const actionOptions = [
          { value: "CREATE", label: "Create" },
          { value: "UPDATE", label: "Update" },
          { value: "DELETE", label: "Delete" },
          { value: "LOGIN", label: "Login" },
          { value: "LOGOUT", label: "Logout" },
        ];

        return (
          <FilterHeader
            title="Action"
            filterValue={column.getFilterValue()}
            options={actionOptions}
            column={column}
            filterKey="Action"
          />
        );
      },
      cell: ({ getValue }) => {
        const action = getValue();
        return (
          <Badge variant={getActionBadgeVariant(action)} className="text-xs">
            {action}
          </Badge>
        );
      },
    }),
    columnHelper.accessor("resource", {
      header: ({ column }) => {
        const resourceOptions = [
          { value: "User", label: "User" },
          { value: "Order", label: "Order" },
          { value: "Product", label: "Product" },
          { value: "Organization", label: "Organization" },
          { value: "AuditLog", label: "Audit Log" },
        ];

        return (
          <FilterHeader
            title="Resource"
            filterValue={column.getFilterValue()}
            options={resourceOptions}
            column={column}
            filterKey="Resource"
          />
        );
      },
      cell: ({ getValue }) => {
        const resource = getValue();
        return (
          <Badge
            variant={getResourceBadgeVariant(resource)}
            className="text-xs"
          >
            {resource}
          </Badge>
        );
      },
    }),
    columnHelper.accessor("userEmail", {
      header: ({ column }) => {
        // Role options based on current user permissions
        const roleOptions = [];

        // Only super_admin can see and filter by super_admin and admin roles
        if (currentUser?.role === "super_admin") {
          roleOptions.push(
            { value: "super_admin", label: "Super Admin" },
            { value: "admin", label: "Admin" }
          );
        }

        // All users can see staff role
        roleOptions.push({ value: "staff", label: "Staff" });

        return (
          <FilterHeader
            title="User"
            filterValue={column.getFilterValue()}
            options={roleOptions}
            column={column}
            filterKey="Role"
            displayValue={(value) => value?.replace("_", " ")}
          />
        );
      },
      cell: ({ getValue, row }) => {
        const email = getValue();
        const role = row.original.userRole;
        return (
          <div className="flex flex-col space-y-1">
            <span
              className="text-sm font-medium truncate max-w-[150px]"
              title={email}
            >
              {email}
            </span>
            <Badge
              variant={getRoleBadgeVariant(role)}
              className="text-xs w-fit"
            >
              {role.replace("_", " ")}
            </Badge>
          </div>
        );
      },
    }),
    columnHelper.accessor("description", {
      header: "Description",
      cell: ({ getValue }) => {
        const description = getValue();
        return (
          <div
            className="max-w-[200px] lg:max-w-[300px] truncate"
            title={description}
          >
            <span className="text-sm">{description}</span>
          </div>
        );
      },
    }),
    columnHelper.accessor("ipAddress", {
      header: "IP Address",
      cell: ({ getValue }) => {
        const ipAddress = getValue();
        const isValidIP =
          ipAddress &&
          ipAddress !== "unknown" &&
          ipAddress !== "undefined" &&
          ipAddress.trim() !== "";
        return (
          <span className="text-sm text-muted-foreground font-mono">
            {isValidIP ? ipAddress : "N/A"}
          </span>
        );
      },
    }),
    columnHelper.accessor("createdAt", {
      header: "Date",
      cell: ({ getValue }) => {
        const date = getValue();
        return (
          <div className="text-sm">
            <div className="font-medium">
              {format(new Date(date), "MMM dd, yyyy")}
            </div>
            <div className="text-muted-foreground">
              {format(new Date(date), "HH:mm:ss")}
            </div>
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const log = row.original;
        return (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader className="pb-3 border-b">
                <DialogTitle className="flex items-center gap-2 text-lg">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Shield className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div>Audit Log Details</div>
                    <div className="text-xs font-normal text-muted-foreground">
                      {format(
                        new Date(log.createdAt),
                        "MMM dd, yyyy 'at' HH:mm:ss"
                      )}
                    </div>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto p-1">
                <div className="space-y-4">
                  {/* Action Summary Card */}
                  <Card className="border-l-4 border-l-primary">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Action Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">
                            Action Type:
                          </label>
                          <Badge
                            variant={getActionBadgeVariant(log.action)}
                            className="text-xs px-2 py-1"
                          >
                            {log.action}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">
                            Resource:
                          </label>
                          <Badge
                            variant={getResourceBadgeVariant(log.resource)}
                            className="text-xs px-2 py-1"
                          >
                            {log.resource}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">
                            User Role:
                          </label>
                          <Badge
                            variant={getRoleBadgeVariant(log.userRole)}
                            className="text-xs px-2 py-1"
                          >
                            {log.userRole.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* User Information Card */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <User className="h-4 w-4" />
                        User Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">
                              Email Address
                            </label>
                            <div className="mt-1 p-2 bg-muted/50 rounded-md">
                              <span className="text-sm font-medium">
                                {log.userEmail}
                              </span>
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">
                              IP Address
                            </label>
                            <div className="mt-1 p-2 bg-muted/50 rounded-md">
                              <span className="text-sm font-mono">
                                {log.ipAddress &&
                                log.ipAddress !== "unknown" &&
                                log.ipAddress !== "undefined" &&
                                log.ipAddress.trim() !== ""
                                  ? log.ipAddress
                                  : "Not available"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">
                              Timestamp
                            </label>
                            <div className="mt-1 p-2 bg-muted/50 rounded-md">
                              <div className="text-sm">
                                <div className="font-medium">
                                  {format(
                                    new Date(log.createdAt),
                                    "EEEE, MMMM dd, yyyy"
                                  )}
                                </div>
                                <div className="text-muted-foreground">
                                  {format(new Date(log.createdAt), "HH:mm:ss")}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">
                              User Agent
                            </label>
                            <div className="mt-1 p-2 bg-muted/50 rounded-md max-h-16 overflow-y-auto">
                              <span className="text-xs text-muted-foreground break-words">
                                {log.userAgent || "Not available"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Description Card */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Description
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-3 bg-muted/30 rounded-lg border">
                        <p className="text-sm leading-relaxed">
                          {log.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Changes Card */}
                  {log.changes && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          Changes Made
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Detailed view of what was modified during this action
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <AuditChangesDisplay
                          changes={log.changes}
                          resource={log.resource}
                          action={log.action}
                        />
                      </CardContent>
                    </Card>
                  )}

                  {/* Metadata Card */}
                  {log.metadata && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          Technical Details
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Additional metadata and system information
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="p-2 bg-muted/30 rounded-lg border">
                          <pre className="text-xs overflow-auto max-h-32 whitespace-pre-wrap">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        );
      },
    }),
  ];

  if (isLoading) {
    return <PageLayout isLoading={true} errorMessage="Loading audit logs..." />;
  }

  if (isError) {
    return (
      <div className="min-h-screen w-full max-w-full overflow-x-hidden space-y-3 p-3 sm:space-y-4 sm:p-4 lg:p-6">
        <div className="mb-2">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">
            Audit Logs
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Error loading audit logs data
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Failed to load audit logs
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {error?.message ||
                "An error occurred while loading audit logs data"}
            </p>
            <Button
              onClick={(e) => {
                e.preventDefault();
                refresh();
              }}
              type="button"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PageLayout errorMessage="Failed to load audit logs. Please try refreshing the page.">
      <PageHeader
        title="Audit Logs"
        description="Monitor system activities and user actions"
        icon={Activity}
      />

      {/* Stats Cards */}
      <KPICardsGrid>
        <KPICard
          title="Total Logs"
          value={pagination.totalCount || 0}
          icon={Database}
          period="All audit log entries"
        />
        <KPICard
          title="Recent Activity"
          value={auditLogs.length}
          icon={TrendingUp}
          period="Current view"
        />
        <KPICard
          title="Actions Today"
          value={stats.todayActions}
          icon={Clock}
          period="Today's actions"
        />
        <KPICard
          title="Active Users"
          value={stats.uniqueUsers}
          icon={Users}
          period="Unique users"
        />
      </KPICardsGrid>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Audit Logs
              </CardTitle>
              <CardDescription>
                {pagination.totalCount || 0} total logs found
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Force table re-render to clear all filters
                setTableKey((prev) => prev + 1);
              }}
              className="text-xs"
            >
              Clear All Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            key={tableKey}
            columns={columns}
            data={auditLogs}
            searchKey="description"
            searchPlaceholder="Search audit logs..."
            showColumnToggle={true}
            showAddButton={false}
          />
        </CardContent>
      </Card>
    </PageLayout>
  );
}
