"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createColumnHelper } from "@tanstack/react-table";
import { RefreshCw, Utensils } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { PageLayout } from "@/features/dashboard/components/page-layout";
import { PageHeader } from "@/features/dashboard/components/page-header";
import { useOrdersManagement } from "@/features/pos/hooks/use-orders";
import { useMutationState } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  getOrderStatusInfo,
  getPaymentMethodInfo,
  getDeliveryTypeInfo,
  formatOrderDate,
} from "@/features/pos/utils/order.utils";
import { filterOrders } from "@/features/pos/utils/order.utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function OrdersPage() {
  const router = useRouter();
  const {
    data: ordersData,
    isLoading,
    isError,
    error,
    refetch,
  } = useOrdersManagement();

  const pendingOrders = useMutationState({
    filters: { mutationKey: ["orders"], status: "pending" },
    select: (mutation) => {
      const order = mutation.state.variables;
      return {
        ...order,
        id: `pending-${Math.random()}`,
        orderNumber: "SYNCING...",
        createdAt: new Date().toISOString(),
        isPending: true,
      };
    },
  });

  const orders = useMemo(() => {
    const fetchedOrders = ordersData?.orders || [];

    const existingKeys = new Set(fetchedOrders.map((o) => o.idempotencyKey));
    const uniquePending = pendingOrders.filter(
      (o) => !existingKeys.has(o.idempotencyKey),
    );

    return [...uniquePending, ...fetchedOrders];
  }, [ordersData?.orders, pendingOrders]);

  const [statusFilter, setStatusFilter] = useState("all");

  const filteredOrders = useMemo(() => {
    return filterOrders(orders, { status: statusFilter });
  }, [orders, statusFilter]);

  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor("orderNumber", {
        header: "Order #",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="font-medium text-sm">
              {row.original.orderNumber}
            </div>
            {row.original.isPending && (
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            )}
          </div>
        ),
      }),
      columnHelper.accessor("customerName", {
        header: "Customer",
        cell: ({ row }) => {
          const order = row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {order.customerName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-sm">{order.customerName}</div>
                {order.mobileNumber && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    {order.mobileNumber}
                  </div>
                )}
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("items", {
        header: "Items",
        cell: ({ row }) => {
          const items = row.getValue("items");
          const totalItems = items.reduce(
            (sum, item) => sum + item.quantity,
            0,
          );
          return (
            <div className="text-sm">
              <div className="font-medium">{totalItems} items</div>
              <div className="text-muted-foreground text-xs">
                {items.length} different
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("total", {
        header: "Total",
        cell: ({ row }) => (
          <div className="font-mono font-medium text-sm">
            ${row.getValue("total").toFixed(2)}
          </div>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status");
          const statusInfo = getOrderStatusInfo(status);
          const Icon = statusInfo.icon;
          return (
            <div className="flex items-center gap-2">
              <Icon className={`h-3 w-3 ${statusInfo.color}`} />
              <Badge variant={statusInfo.variant} className="text-xs">
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
            </div>
          );
        },
      }),
      columnHelper.accessor("paymentMethod", {
        header: "Payment",
        cell: ({ row }) => {
          const method = row.getValue("paymentMethod");
          const info = getPaymentMethodInfo(method);
          const Icon = info.icon;
          return (
            <div className="flex items-center gap-2">
              <Icon className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm">{info.label}</span>
            </div>
          );
        },
      }),
      columnHelper.accessor("deliveryType", {
        header: "Type",
        cell: ({ row }) => {
          const type = row.getValue("deliveryType");
          const info = getDeliveryTypeInfo(type);
          const Icon = info.icon;
          return (
            <div className="flex items-center gap-2">
              <Icon className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm">{info.label}</span>
            </div>
          );
        },
      }),
      columnHelper.accessor("createdAt", {
        header: "Date",
        cell: ({ row }) => {
          const date = row.getValue("createdAt");
          const { date: d, time } = formatOrderDate(date);
          return (
            <div className="text-sm">
              <div className="font-medium">{d}</div>
              <div className="text-muted-foreground">{time}</div>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const order = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <Utensils className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    router.push(`/admin/dashboard/orders/${order.id}`)
                  }
                >
                  View Details
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      }),
    ],
    [router],
  );

  return (
    <PageLayout
      isLoading={isLoading}
      error={isError ? error : null}
      errorMessage="Failed to load orders management. Please try refreshing the page."
    >
      <PageHeader
        title="Orders Management"
        description="Manage and track all restaurant orders"
        icon={Utensils}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5" />
                All Orders
              </CardTitle>
              <CardDescription>
                Manage orders, status updates, and customer information
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Tabs
              defaultValue="all"
              value={statusFilter}
              onValueChange={setStatusFilter}
              className="w-full"
            >
              <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border"
                >
                  All Orders
                </TabsTrigger>
                <TabsTrigger
                  value="pending"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border"
                >
                  Pending
                </TabsTrigger>
                <TabsTrigger
                  value="confirmed"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border"
                >
                  Confirmed
                </TabsTrigger>
                <TabsTrigger
                  value="preparing"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border"
                >
                  Preparing
                </TabsTrigger>
                <TabsTrigger
                  value="ready"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border"
                >
                  Ready
                </TabsTrigger>
                <TabsTrigger
                  value="completed"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border"
                >
                  Completed
                </TabsTrigger>
                <TabsTrigger
                  value="cancelled"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border"
                >
                  Cancelled
                </TabsTrigger>
                <TabsTrigger
                  value="refunded"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border"
                >
                  Refunded
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <DataTable
              data={filteredOrders}
              columns={columns}
              searchKey="orderNumber"
              searchPlaceholder="Search orders by number or customer..."
              showAddButton={false}
            />
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
