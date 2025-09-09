"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

// KPI Card Component (matching analytics page design)
export function KPICard({
  title,
  value,
  change,
  trend,
  period,
  icon: Icon,
  className = "",
  ...props
}) {
  const isPositive = trend === "up";

  return (
    <Card className={`@container/card ${className}`} {...props}>
      <CardHeader className="pb-2">
        <div>
          <CardDescription className="text-xs">{title}</CardDescription>
          <CardTitle className="text-lg font-semibold tabular-nums sm:text-xl @[250px]/card:text-2xl">
            {value}
          </CardTitle>
        </div>
        <CardAction>
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          {change && (
            <Badge
              variant="outline"
              className="text-xs flex items-center gap-1"
            >
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {change}
            </Badge>
          )}
        </CardAction>
      </CardHeader>
      {period && (
        <CardFooter className="flex-col items-start gap-1 text-xs pt-0">
          <div className="line-clamp-1 flex gap-1 font-medium">
            {isPositive ? "Trending up" : "Down this period"}{" "}
            {isPositive ? (
              <TrendingUp className="size-3" />
            ) : (
              <TrendingDown className="size-3" />
            )}
          </div>
          <div className="text-muted-foreground">{period}</div>
        </CardFooter>
      )}
    </Card>
  );
}

// KPI Cards Grid Component
export function KPICardsGrid({ children, className = "" }) {
  return (
    <div
      className={`w-full *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs ${className}`}
    >
      {children}
    </div>
  );
}
