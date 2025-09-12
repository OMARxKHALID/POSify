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

// Chart configurations
const chartConfig = {
  sales: {
    label: "Sales",
    color: "var(--primary)",
  },
};

// Table column definitions
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

// Analytics Dashboard Page
export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = React.useState("30d");

  // Fetch analytics data from API
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

  // Extract data from API response with fallbacks
  const sales = analyticsData?.sales || {
    dailySales: [],
    hourlySales: [],
    topItems: [],
  };
  const performance = analyticsData?.performance || { kpis: [] };
  const inventory = analyticsData?.inventory || { lowStock: [] };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen w-full max-w-full overflow-x-hidden space-y-3 p-3 sm:space-y-4 sm:p-4 lg:p-6">
        <div className="mb-2">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">
            Analytics Dashboard
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Loading analytics data...
          </p>
        </div>
        <div className="grid gap-3 sm:gap-4 lg:gap-6">
          <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
          <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (isError) {
    return (
      <div className="min-h-screen w-full max-w-full overflow-x-hidden space-y-3 p-3 sm:space-y-4 sm:p-4 lg:p-6">
        <div className="mb-2">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">
            Analytics Dashboard
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Error loading analytics data
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Failed to load analytics
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {error?.message ||
                "An error occurred while loading analytics data"}
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no data
  const hasData =
    sales.dailySales.length > 0 ||
    sales.topItems.length > 0 ||
    performance.kpis.some((kpi) => kpi.value !== "$0" && kpi.value !== "0");

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden space-y-3 p-3 sm:space-y-4 sm:p-4 lg:p-6">
      {/* Page Header */}
      <div className="mb-2">
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">
          Analytics Dashboard
        </h1>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Comprehensive insights into your restaurant's performance
        </p>
      </div>

      {/* Empty State */}
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

      {/* Main Content Grid */}
      <div className="grid gap-3 sm:gap-4 lg:gap-6">
        {/* Key Performance Indicators */}
        <KPICardsGrid>
          {performance.kpis.map((kpi, index) => (
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

        {/* Charts Row */}
        <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
          {/* Daily Sales Trend */}
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

          {/* Hourly Sales */}
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

          {/* Top Selling Items */}
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

        {/* Bottom Row - Inventory Alerts */}
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
                  // TODO: Implement add inventory item functionality
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
