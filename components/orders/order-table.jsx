"use client";

import { useRouter } from "next/navigation";
import { createColumnHelper } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Printer,
  Phone,
  Filter,
} from "lucide-react";

import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  getOrderStatusInfo,
  getPaymentMethodInfo,
  getDeliveryTypeInfo,
  formatOrderDate,
} from "@/lib/utils/order-utils";
import { ORDER_STATUSES } from "@/constants";

// Column helper for table
const columnHelper = createColumnHelper();

export function OrderTable({
  orders,
  onStatusFilterChange,
  statusFilter = "all",
  showFilters = true,
}) {
  const router = useRouter();

  // Define table columns
  const columns = [
    columnHelper.accessor("orderNumber", {
      header: "Order #",
      cell: ({ row }) => {
        const order = row.original;
        return <div className="font-medium text-sm">{order.orderNumber}</div>;
      },
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
                  <Phone className="h-3 w-3" />
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
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
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
      cell: ({ row }) => {
        const total = row.getValue("total");
        return (
          <div className="font-mono font-medium text-sm">
            ${total.toFixed(2)}
          </div>
        );
      },
    }),
    columnHelper.accessor("status", {
      header: ({ column, table }) => {
        if (!showFilters) return "Status";

        return (
          <div className="flex items-center gap-2">
            <span>Status</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Filter className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[150px]">
                <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={statusFilter === "all"}
                  onCheckedChange={() => onStatusFilterChange("all")}
                >
                  All
                </DropdownMenuCheckboxItem>
                {ORDER_STATUSES.map((status) => (
                  <DropdownMenuCheckboxItem
                    key={status.value}
                    checked={statusFilter === status.value}
                    onCheckedChange={() => onStatusFilterChange(status.value)}
                  >
                    {status.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
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
        const methodInfo = getPaymentMethodInfo(method);
        const Icon = methodInfo.icon;
        return (
          <div className="flex items-center gap-2">
            <Icon className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm">{methodInfo.label}</span>
          </div>
        );
      },
    }),
    columnHelper.accessor("deliveryType", {
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("deliveryType");
        const typeInfo = getDeliveryTypeInfo(type);
        const Icon = typeInfo.icon;
        return (
          <div className="flex items-center gap-2">
            <Icon className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm">{typeInfo.label}</span>
          </div>
        );
      },
    }),
    columnHelper.accessor("createdAt", {
      header: "Date",
      cell: ({ row }) => {
        const date = row.getValue("createdAt");
        const { date: formattedDate, time } = formatOrderDate(date);
        return (
          <div className="text-sm">
            <div className="font-medium">{formattedDate}</div>
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
                <MoreHorizontal className="h-4 w-4" />
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
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/admin/dashboard/orders/${order.id}/edit`)
                }
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Order
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/admin/dashboard/receipts/${order.id}`)
                }
              >
                <Printer className="mr-2 h-4 w-4" />
                Print Receipt
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    }),
  ];

  return (
    <DataTable
      data={orders}
      columns={columns}
      searchKey="orderNumber"
      searchPlaceholder="Search orders by number or customer..."
      showAddButton={false}
    />
  );
}
