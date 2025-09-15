"use client";

import React, { useState } from "react";
import { X, Clock, ShoppingBag, RefreshCw, CloudOff } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MAX_ITEMS_DISPLAY = 3;

const SyncButton = ({ isSyncing, children }) => (
  <Button size="sm" variant="outline" className="text-xs">
    {isSyncing ? (
      <>
        <RefreshCw className="w-3 h-3 animate-spin mr-1" />
        Syncing…
      </>
    ) : (
      children
    )}
  </Button>
);

const RetryButton = ({ isSyncing, children }) => (
  <Button size="sm" variant="outline" className="text-xs" disabled={isSyncing}>
    {isSyncing ? (
      <>
        <RefreshCw className="w-3 h-3 animate-spin mr-1" />
        Syncing…
      </>
    ) : (
      children
    )}
  </Button>
);

const OrderItemDisplay = ({ items }) => (
  <div className="text-xs text-muted-foreground leading-relaxed">
    {items?.slice(0, MAX_ITEMS_DISPLAY).map((item, idx) => (
      <span key={idx}>
        {item.quantity}× {item.name}
        {idx < Math.min(items.length, MAX_ITEMS_DISPLAY) - 1 && ", "}
      </span>
    ))}
    {items?.length > MAX_ITEMS_DISPLAY && (
      <span className="text-muted-foreground/70">
        {" "}
        and {items.length - MAX_ITEMS_DISPLAY} more…
      </span>
    )}
  </div>
);

export function OrderQueueManager({ trigger }) {
  const [isSyncing] = useState(false);

  const mockQueuedOrders = [
    {
      id: "1",
      customerName: "John Doe",
      orderNumber: "A101",
      tableNumber: "5",
      queuedAt: new Date(),
      items: [
        { name: "Burger", quantity: 2 },
        { name: "Fries", quantity: 1 },
      ],
      total: 18.5,
    },
    {
      id: "2",
      customerName: "Jane Smith",
      orderNumber: "A102",
      queuedAt: new Date(),
      items: [{ name: "Pizza", quantity: 1 }],
      total: 12.0,
    },
  ];

  const mockFailedOrders = [
    {
      id: "f1",
      customerName: "Alice",
      total: 25.0,
      error: "Network error",
      items: [{ name: "Pasta", quantity: 2 }],
    },
  ];

  const renderFailedOrders = () =>
    mockFailedOrders.length > 0 && (
      <Card className="border-destructive/20 bg-destructive/5 mb-3">
        <CardHeader className="pb-2 flex items-center justify-between">
          <CardTitle className="text-sm text-destructive">
            Failed Orders ({mockFailedOrders.length})
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-destructive hover:text-destructive"
          >
            Clear All
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {mockFailedOrders.map((o) => (
            <Card key={o.id} className="border-destructive/20">
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-card-foreground">
                    {o.customerName || "Guest"} – ${o.total?.toFixed(2) ?? "-"}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-xs text-destructive break-all">{o.error}</p>
                <RetryButton isSyncing={isSyncing}>Retry</RetryButton>
              </CardContent>
            </Card>
          ))}
          <RetryButton isSyncing={isSyncing} className="w-full">
            Retry All
          </RetryButton>
        </CardContent>
      </Card>
    );

  const renderQueuedOrders = () =>
    mockQueuedOrders.map((o) => (
      <Card key={o.id} className="hover:shadow-sm transition-shadow">
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row sm:items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-sm font-medium text-card-foreground">
                  {o.customerName || "Guest"}
                </h3>
                {o.orderNumber && (
                  <Badge variant="secondary">Order: {o.orderNumber}</Badge>
                )}
                {o.tableNumber && (
                  <Badge variant="outline">Table: {o.tableNumber}</Badge>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                <Clock className="w-3 h-3" />
                <span>{o.queuedAt.toLocaleString()}</span>
              </div>

              <OrderItemDisplay items={o.items} />
            </div>

            <div className="flex items-center sm:flex-col sm:items-end gap-2">
              <div className="text-sm font-semibold text-card-foreground">
                ${o.total?.toFixed(2) ?? "-"}
              </div>
              <Badge variant="secondary" className="text-xs">
                Pending
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    ));

  const footer =
    mockQueuedOrders.length > 0 || mockFailedOrders.length > 0 ? (
      <div className="px-4 py-3 bg-muted/30 border-t flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="text-xs text-muted-foreground font-medium">
          {mockQueuedOrders.length + mockFailedOrders.length} orders in queue
        </div>
        <div className="flex gap-2">
          <RetryButton isSyncing={isSyncing}>Sync Now</RetryButton>
          <Button
            variant="outline"
            size="sm"
            className="text-xs text-destructive border-destructive/20 hover:bg-destructive/10"
          >
            Clear All
          </Button>
        </div>
      </div>
    ) : null;

  const body = (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="pb-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <CloudOff className="w-4 h-4 text-yellow-600" />
          <CardTitle className="text-base">
            Order Queue ({mockQueuedOrders.length + mockFailedOrders.length})
          </CardTitle>
        </div>
        <SyncButton isSyncing={isSyncing}>Manual Sync</SyncButton>
      </CardHeader>

      <CardContent className="p-0">
        <div className="max-h-[70vh] overflow-y-auto px-4 pb-4">
          {renderFailedOrders()}
          {mockQueuedOrders.length > 0 ? (
            <div className="space-y-3">{renderQueuedOrders()}</div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <ShoppingBag className="w-8 h-8 text-muted-foreground mb-3" />
              <p className="text-muted-foreground text-sm font-medium">
                No queued orders
              </p>
              <p className="text-muted-foreground/70 text-xs mt-1">
                Orders will appear here when added to queue
              </p>
            </div>
          )}
        </div>
      </CardContent>
      {footer}
    </Card>
  );

  if (trigger) {
    return (
      <Popover>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent
          align="end"
          className="p-0 w-[90vw] sm:w-[400px] lg:w-[500px] max-w-full"
          sideOffset={8}
        >
          {body}
        </PopoverContent>
      </Popover>
    );
  }
  return body;
}
