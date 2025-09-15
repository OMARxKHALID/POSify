"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, RefreshCw, Utensils } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { PageLayout } from "@/components/dashboard/page-layout";
import { PageHeader } from "@/components/dashboard/page-header";
import { useOrdersManagement } from "@/hooks/use-orders";
import { OrderTable } from "@/components/orders/order-table";
import { OrderStats } from "@/components/orders/order-stats";
import { filterOrders } from "@/lib/utils/order-utils";

export default function OrdersPage() {
  const router = useRouter();
  const {
    data: ordersData,
    isLoading,
    isError,
    error,
    refetch,
  } = useOrdersManagement();

  // Extract data from API response
  const orders = useMemo(() => ordersData?.orders || [], [ordersData?.orders]);
  const pagination = useMemo(
    () => ordersData?.pagination || {},
    [ordersData?.pagination]
  );

  // Filter states
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter orders based on selected filters
  const filteredOrders = useMemo(() => {
    return filterOrders(orders, { status: statusFilter });
  }, [orders, statusFilter]);

  // Handle create order navigation
  const handleCreateOrder = () => {
    router.push("/admin/dashboard/orders/create");
  };

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

      {/* Order Statistics */}
      <OrderStats orders={orders} pagination={pagination} />

      {/* Orders Table */}
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
              <Button onClick={handleCreateOrder}>
                <Plus className="h-4 w-4 mr-2" />
                New Order
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <OrderTable
            orders={filteredOrders}
            onStatusFilterChange={setStatusFilter}
            statusFilter={statusFilter}
            showFilters={true}
          />
        </CardContent>
      </Card>
    </PageLayout>
  );
}
