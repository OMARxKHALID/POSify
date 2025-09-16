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
import { useOrderQueueStore } from "@/lib/store/use-queue-order-store";
import { useOrderQueueSync } from "@/hooks/use-order-queue-sync";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { toast } from "sonner";

const MAX_ITEMS_DISPLAY = 2;

const SyncButton = ({ isSyncing, children, onClick, ...props }) => (
  <Button
    size="sm"
    variant="outline"
    className="text-xs h-7 px-2"
    onClick={onClick}
    disabled={isSyncing}
    {...props}
  >
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
        +{items.length - MAX_ITEMS_DISPLAY} more
      </span>
    )}
  </div>
);

export function OrderQueueManager({ trigger }) {
  const [isSyncing, setIsSyncing] = useState(false);
  const { isOnline } = useNetworkStatus();
  const {
    syncQueuedOrders,
    syncSingleOrder,
    isSyncing: syncHookSyncing,
  } = useOrderQueueSync();

  const {
    getQueuedOrders,
    getFailedOrders,
    removeOrder,
    removeFailedOrder,
    clearAllOrders,
    clearFailedOrders,
    getQueueStats,
  } = useOrderQueueStore();

  const queuedOrders = getQueuedOrders();
  const failedOrders = getFailedOrders();
  const queueStats = getQueueStats();

  const handleSyncAll = async () => {
    if (!isOnline) {
      toast.error("No internet connection", {
        description: "Please check your connection and try again.",
      });
      return;
    }

    setIsSyncing(true);
    try {
      await syncQueuedOrders();
      toast.success("All orders synced successfully");
    } catch (error) {
      toast.error("Failed to sync orders", {
        description: error.message,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncSingle = async (order) => {
    if (!isOnline) {
      toast.error("No internet connection");
      return;
    }

    setIsSyncing(true);
    try {
      await syncSingleOrder(order);
      toast.success("Order synced successfully");
    } catch (error) {
      toast.error("Failed to sync order", {
        description: error.message,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRemoveOrder = (idempotencyKey) => {
    removeOrder(idempotencyKey);
    toast.success("Order removed from queue");
  };

  const handleRemoveFailedOrder = (idempotencyKey) => {
    removeFailedOrder(idempotencyKey);
    toast.success("Failed order removed");
  };

  const handleClearAll = () => {
    clearAllOrders();
    toast.success("All orders cleared from queue");
  };

  const renderFailedOrders = () =>
    failedOrders.length > 0 && (
      <div className="bg-destructive/5 border-l-2 border-destructive p-2 mb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-destructive">
            Failed ({failedOrders.length})
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-destructive hover:text-destructive h-5 px-1"
            onClick={clearFailedOrders}
          >
            Clear
          </Button>
        </div>
        {failedOrders.map((o) => (
          <div
            key={o.idempotencyKey}
            className="bg-background rounded p-2 mb-1"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium">
                {o.customerName || "Guest"} – ${o.total?.toFixed(2) ?? "-"}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 text-destructive hover:text-destructive"
                onClick={() => handleRemoveFailedOrder(o.idempotencyKey)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            <p className="text-xs text-destructive mb-1">{o.error}</p>
            <SyncButton
              isSyncing={isSyncing || syncHookSyncing}
              onClick={() => handleSyncSingle(o)}
            >
              Retry
            </SyncButton>
          </div>
        ))}
      </div>
    );

  const renderQueuedOrders = () =>
    queuedOrders.map((o) => (
      <div
        key={o.idempotencyKey}
        className="bg-muted/30 rounded p-3 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium">
                {o.customerName || "Guest"}
              </span>
              {o.orderNumber && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                  #{o.orderNumber}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
              <Clock className="w-3 h-3" />
              <span>{new Date(o.queuedAt).toLocaleTimeString()}</span>
            </div>

            <OrderItemDisplay items={o.items} />
          </div>

          <div className="flex items-center flex-col items-end gap-2 ml-2">
            <div className="text-sm font-semibold">
              ${o.total?.toFixed(2) ?? "-"}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-destructive"
              onClick={() => handleRemoveOrder(o.idempotencyKey)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    ));

  const footer =
    queuedOrders.length > 0 || failedOrders.length > 0 ? (
      <div className="px-3 py-2 bg-muted/30 border-t flex justify-between items-center">
        <span className="text-xs text-muted-foreground">
          {queuedOrders.length + failedOrders.length} orders
        </span>
        <div className="flex gap-1">
          <SyncButton
            isSyncing={isSyncing || syncHookSyncing}
            onClick={handleSyncAll}
          >
            Sync
          </SyncButton>
          <Button
            variant="outline"
            size="sm"
            className="text-xs text-destructive border-destructive/20 hover:bg-destructive/10 h-7 px-2"
            onClick={handleClearAll}
          >
            Clear
          </Button>
        </div>
      </div>
    ) : null;

  const body = (
    <div className="w-full">
      <div className="px-3 py-2 border-b bg-muted/30 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <CloudOff className="w-4 h-4 text-yellow-600" />
          <span className="text-sm font-medium">
            Queue ({queuedOrders.length + failedOrders.length})
          </span>
        </div>
        <SyncButton
          isSyncing={isSyncing || syncHookSyncing}
          onClick={handleSyncAll}
        >
          Sync
        </SyncButton>
      </div>

      <div className="max-h-[50vh] overflow-y-auto">
        {renderFailedOrders()}
        {queuedOrders.length > 0 ? (
          <div className="p-3 space-y-2">{renderQueuedOrders()}</div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 px-3">
            <ShoppingBag className="w-6 h-6 text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm">No queued orders</p>
          </div>
        )}
      </div>
      {footer}
    </div>
  );

  if (trigger) {
    return (
      <Popover>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent
          align="end"
          className="p-0 w-[420px] max-w-[90vw]"
          sideOffset={8}
        >
          {body}
        </PopoverContent>
      </Popover>
    );
  }
  return body;
}
