"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createColumnHelper } from "@tanstack/react-table";
import {
  DollarSign,
  MoreHorizontal,
  Eye,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

import { PageLayout } from "@/components/dashboard/page-layout";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/ui/data-table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useTransactionsWithFilters } from "@/hooks/use-transactions";
import { formatCurrency, formatDate } from "@/lib/utils/format-utils";

export default function TransactionsPage() {
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [paymentMethod, setPaymentMethod] = useState("all");

  const filters = useMemo(() => {
    const f = {};
    if (type !== "all") f.type = type;
    if (status !== "all") f.status = status;
    if (paymentMethod !== "all") f.paymentMethod = paymentMethod;
    return f;
  }, [type, status, paymentMethod]);

  const { data, isLoading, error } = useTransactionsWithFilters(filters);

  const transactions = data?.transactions || [];

  const router = useRouter();

  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor("transactionNumber", {
        header: "Transaction #",
        cell: ({ row }) => (
          <div className="font-medium text-sm">
            {row.original.transactionNumber}
          </div>
        ),
      }),
      columnHelper.accessor("type", {
        header: "Type",
        cell: ({ row }) => {
          const type = row.getValue("type");
          const info = getTransactionTypeInfo(type);
          const Icon = info.icon;
          return (
            <div className="flex items-center gap-2">
              <Icon className={`h-3 w-3 ${info.color}`} />
              <Badge variant={info.variant} className="text-xs">
                {formatType(type)}
              </Badge>
            </div>
          );
        },
      }),
      columnHelper.accessor("amount", {
        header: "Amount",
        cell: ({ row }) => {
          const t = row.original;
          const isRefund = t.type === "refund";
          const amount = t.signedAmount || t.amount;
          const Icon = isRefund ? TrendingDown : TrendingUp;
          return (
            <div className="flex items-center gap-2">
              <Icon
                className={`h-3 w-3 ${
                  isRefund ? "text-red-500" : "text-green-500"
                }`}
              />
              <div
                className={`font-mono font-medium text-sm ${
                  isRefund ? "text-red-600" : "text-green-600"
                }`}
              >
                {isRefund ? "-" : "+"}
                {formatCurrency(Math.abs(amount))}
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("paymentMethod", {
        header: "Payment",
        cell: ({ row }) => (
          <span className="text-sm capitalize">
            {row.getValue("paymentMethod")}
          </span>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status");
          const info = getTransactionStatusInfo(status);
          return (
            <Badge variant={info.variant} className="text-xs">
              {capitalize(status)}
            </Badge>
          );
        },
      }),
      columnHelper.accessor("processedBy", {
        header: "Processed By",
        cell: ({ row }) => {
          const processedBy = row.getValue("processedBy");
          if (!processedBy)
            return <div className="text-sm text-muted-foreground">System</div>;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {getInitials(processedBy.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-sm">{processedBy.name}</div>
                <div className="text-xs text-muted-foreground">
                  {processedBy.email}
                </div>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("processedAt", {
        header: "Date",
        cell: ({ row }) => {
          const date = row.getValue("processedAt");
          const { date: d, time } = formatDate(date);
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
          const t = row.original;
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
                    router.push(`/admin/dashboard/transactions/${t.id}`)
                  }
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      }),
    ],
    [router]
  );

  return (
    <PageLayout isLoading={isLoading} error={error}>
      <PageHeader
        title="Transactions"
        description="View and analyze all payment, refund, and cash drawer activity."
        icon={DollarSign}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            All Transactions
          </CardTitle>
          <CardDescription>
            View and manage payments, refunds, and cash drawer entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={transactions}
            columns={columns}
            searchKey="transactionNumber"
            searchPlaceholder="Search transactions by number or reference..."
            showAddButton={false}
          />
        </CardContent>
      </Card>
    </PageLayout>
  );
}

function formatType(type) {
  return type.charAt(0).toUpperCase() + type.slice(1).replace("_", " ");
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function getInitials(name) {
  return name
    ?.split(" ")
    .map((n) => n[0])
    .join("");
}

function getTransactionTypeInfo(type) {
  const typeMap = {
    payment: { icon: TrendingUp, color: "text-green-500", variant: "default" },
    refund: {
      icon: TrendingDown,
      color: "text-red-500",
      variant: "destructive",
    },
    adjustment: {
      icon: DollarSign,
      color: "text-blue-500",
      variant: "secondary",
    },
    cash_drawer: {
      icon: DollarSign,
      color: "text-orange-500",
      variant: "outline",
    },
  };
  return (
    typeMap[type] || {
      icon: DollarSign,
      color: "text-gray-500",
      variant: "default",
    }
  );
}

function getTransactionStatusInfo(status) {
  const statusMap = {
    completed: { variant: "default" },
    pending: { variant: "secondary" },
    failed: { variant: "destructive" },
    cancelled: { variant: "outline" },
  };
  return statusMap[status] || { variant: "default" };
}
