"use client";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { KPICard, KPICardsGrid } from "@/components/ui/kpi-card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAnalytics } from "@/hooks/use-analytics";
import { BarChart, Bar, XAxis, CartesianGrid, Area, AreaChart } from "recharts";
import { TrendingUp, AlertTriangle } from "lucide-react";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "@/components/dashboard/page-layout";
import { PageHeader } from "@/components/dashboard/page-header";

const chartConfig = {
  sales: {
    label: "Sales",
    color: "var(--primary)",
  },
};

const topItemsColumns = [
  {
    accessorKey: "name",
    header: "Item Name",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <Badge variant="secondary">{row.getValue("category")}</Badge>
    ),
  },
  {
    accessorKey: "sales",
    header: "Sales",
    cell: ({ row }) => (
      <div className="font-mono">${row.getValue("sales")}</div>
    ),
  },
  {
    accessorKey: "orders",
    header: "Orders",
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("orders")}</div>
    ),
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => (
      <div className="font-mono">${row.getValue("price")}</div>
    ),
  },
];

const inventoryColumns = [
  {
    accessorKey: "item",
    header: "Item",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("item")}</div>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <Badge variant="secondary">{row.getValue("category")}</Badge>
    ),
  },
  {
    accessorKey: "current",
    header: "Current Stock",
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("current")}</div>
    ),
  },
  {
    accessorKey: "min",
    header: "Minimum Required",
    cell: ({ row }) => <div className="text-center">{row.getValue("min")}</div>,
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => <Badge variant="destructive">Low Stock</Badge>,
  },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d");
  const router = useRouter();

  const {
    data: analyticsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useAnalytics({
    timeRange,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const sales = analyticsData?.sales || {
    dailySales: [],
    hourlySales: [],
    topItems: [],
  };
  const rawPerformance = analyticsData?.performance || {};
  const inventory = analyticsData?.inventory || { lowStock: [] };

  const kpis = useMemo(() => {
    const raw = rawPerformance.kpis;
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === "object") {
      return [
        {
          title: "Total Revenue",
          value: `$${Number(raw.totalRevenue || 0).toLocaleString()}`,
          change: "",
          trend: "up",
          period: "",
        },
        {
          title: "Total Orders",
          value: String(raw.totalOrders || 0),
          change: "",
          trend: "up",
          period: "",
        },
        {
          title: "Avg Order Value",
          value: `$${Number(raw.averageOrderValue || 0).toFixed(2)}`,
          change: "",
          trend: "up",
          period: "",
        },
        {
          title: "Completion Rate",
          value: `${raw.completionRate || 0}%`,
          change: "",
          trend: "up",
          period: "",
        },
      ];
    }
    return [];
  }, [rawPerformance.kpis]);

  const hasData =
    sales.dailySales.length > 0 ||
    sales.topItems.length > 0 ||
    kpis.some((kpi) => kpi.value !== "$0" && kpi.value !== "0");

  return (
    <PageLayout
      isLoading={isLoading}
      error={isError ? error : null}
      errorMessage="Failed to load analytics data. Please try refreshing the page."
    >
      <PageHeader
        title="Analytics Dashboard"
        description="Comprehensive insights into your restaurant's performance"
        icon={TrendingUp}
      />

      {!hasData && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              No Analytics Data Available
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start taking orders to see your analytics data here.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:gap-4 lg:gap-6">
        <KPICardsGrid>
          {kpis.map((kpi, index) => (
            <KPICard
              key={index}
              title={kpi.title}
              value={kpi.value}
              change={kpi.change}
              trend={kpi.trend}
              period={kpi.period}
            />
          ))}
        </KPICardsGrid>

        <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
          <Card className="@container/card w-full">
            <CardHeader className="pb-3">
              <div>
                <CardTitle className="text-base sm:text-lg">
                  Daily Sales Trend
                </CardTitle>
                <CardDescription className="text-xs">
                  <span className="hidden @[540px]/card:block">
                    Sales performance over the selected period
                  </span>
                  <span className="@[540px]/card:hidden">
                    Sales performance
                  </span>
                </CardDescription>
              </div>
              <CardAction>
                <ToggleGroup
                  type="single"
                  value={timeRange}
                  onValueChange={setTimeRange}
                  variant="outline"
                  className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
                >
                  <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
                  <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
                  <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
                </ToggleGroup>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger
                    className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
                    size="sm"
                    aria-label="Select time range"
                  >
                    <SelectValue placeholder="Last 30 days" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="90d" className="rounded-lg">
                      Last 3 months
                    </SelectItem>
                    <SelectItem value="30d" className="rounded-lg">
                      Last 30 days
                    </SelectItem>
                    <SelectItem value="7d" className="rounded-lg">
                      Last 7 days
                    </SelectItem>
                  </SelectContent>
                </Select>
              </CardAction>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
              <ChartContainer
                config={chartConfig}
                className="aspect-auto h-[200px] w-full"
              >
                <AreaChart data={sales.dailySales}>
                  <defs>
                    <linearGradient id="fillSales" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--color-sales)"
                        stopOpacity={1.0}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-sales)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={32}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                    }}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        labelFormatter={(value) => {
                          return new Date(value).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          });
                        }}
                        indicator="dot"
                      />
                    }
                  />
                  <Area
                    dataKey="sales"
                    type="natural"
                    fill="url(#fillSales)"
                    stroke="var(--color-sales)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="w-full">
            <CardHeader className="pb-3">
              <div>
                <CardTitle className="text-base sm:text-lg">
                  Hourly Sales Today
                </CardTitle>
                <CardDescription className="text-xs">
                  Sales distribution throughout the day
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
              <ChartContainer
                config={chartConfig}
                className="aspect-auto h-[200px] w-full"
              >
                <BarChart data={sales.hourlySales}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="hour"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Bar
                    dataKey="sales"
                    fill="var(--color-sales)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="w-full">
            <CardHeader className="pb-3">
              <div>
                <CardTitle className="text-base sm:text-lg">
                  Top Selling Items
                </CardTitle>
                <CardDescription className="text-xs">
                  Best performing menu items
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                data={sales.topItems}
                columns={topItemsColumns}
                searchKey="name"
                searchPlaceholder="Search items..."
              />
            </CardContent>
          </Card>
        </div>

        <div className="w-full">
          <Card className="w-full">
            <CardHeader className="pb-3">
              <div>
                <CardTitle className="flex items-center text-base sm:text-lg">
                  <AlertTriangle className="h-4 w-4 text-orange-500 mr-2" />
                  Low Stock Alerts
                </CardTitle>
                <CardDescription className="text-xs">
                  Items that need restocking
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                data={inventory.lowStock}
                columns={inventoryColumns}
                searchKey="item"
                searchPlaceholder="Search inventory..."
                showAddButton={true}
                addButtonText="Add Item"
                onAddClick={() => {
                  router.push("/admin/dashboard/menu");
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
