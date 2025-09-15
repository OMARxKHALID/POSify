import { useEffect, useRef, useCallback } from "react";
import { useOrderQueueStore } from "@/lib/store/use-queue-order-store";
import { toast } from "sonner";
import { useCreateOrder } from "@/hooks/use-orders";
import { useSettings } from "@/hooks/use-settings";
import { useNetworkStatus } from "@/hooks/use-network-status";

const SYNC_DEBOUNCE_TIME = 2000;
const TRIGGER_COOLDOWN_TIME = 3000;
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;
const NETWORK_STABILITY_DELAY = 1000;

const isDuplicateError = (error) => {
  const message = error?.message || error?.toString() || "";
  return [
    "E11000 duplicate key error",
    "idempotencyKey",
    "orderNumber",
    "already exists",
  ].some((keyword) => message.includes(keyword));
};

const isNetworkError = (error) => {
  const message = error?.message || error?.toString() || "";
  return ["network", "fetch", "timeout"].some((keyword) =>
    message.includes(keyword)
  );
};

const isValidOrder = (order) => {
  return order?.idempotencyKey && order?.items?.length > 0;
};

export function useOrderQueueSync() {
  const {
    removeOrder,
    addFailedOrder,
    removeFailedOrder,
    getQueuedOrders,
    getFailedOrders,
    isOrderProcessed,
  } = useOrderQueueStore();
  const createOrder = useCreateOrder();
  const { settings } = useSettings();
  const { isOnline } = useNetworkStatus();
  const syncMode = settings?.operational?.syncMode || "auto";
  const syncingRef = useRef(false);
  const lastSyncTimeRef = useRef(0);
  const lastTriggerTimeRef = useRef(0);
  const cleanupOrder = useCallback(
    (idempotencyKey) => {
      removeOrder(idempotencyKey);
      removeFailedOrder(idempotencyKey);
    },
    [removeOrder, removeFailedOrder]
  );
  const showSyncToast = useCallback(
    (order, created = true, totalPending = 0) => {
      if (totalPending <= 1) {
        toast.success(created ? "Order synced!" : "Order already synced.", {
          id: order.idempotencyKey,
        });
      }
    },
    []
  );
  const showErrorToast = useCallback((order, error) => {
    const message = error?.message || error?.toString() || "Unknown error";
    toast.error("Failed to sync order.", {
      id: order.idempotencyKey,
      description: message,
    });
  }, []);
  const handleSyncSuccess = useCallback(
    (order, created = true) => {
      cleanupOrder(order.idempotencyKey);
      const totalPending = getQueuedOrders().length + getFailedOrders().length;
      showSyncToast(order, created, totalPending);
    },
    [cleanupOrder, getQueuedOrders, getFailedOrders, showSyncToast]
  );
  const handleSyncError = useCallback(
    (order, error) => {
      if (isDuplicateError(error)) {
        handleSyncSuccess(order, false);
        return;
      }
      const message = error?.message || error?.toString() || "Unknown error";
      addFailedOrder(order, message);
      showErrorToast(order, error);
    },
    [addFailedOrder, handleSyncSuccess, showErrorToast]
  );
  const processOrderWithRetry = useCallback(
    async (order) => {
      if (!isValidOrder(order)) {
        cleanupOrder(order.idempotencyKey);
        return { success: false, skipped: true };
      }
      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          const response = await createOrder.mutateAsync(order);
          handleSyncSuccess(order, response?.created);
          return { success: true, created: response?.created };
        } catch (error) {
          if (isDuplicateError(error)) {
            handleSyncSuccess(order, false);
            return { success: true, created: false };
          }
          if (attempt < MAX_RETRIES && isNetworkError(error)) {
            await new Promise((resolve) =>
              setTimeout(resolve, RETRY_DELAY * (attempt + 1))
            );
            continue;
          }
          handleSyncError(order, error);
          return { success: false, error };
        }
      }
    },
    [createOrder, handleSyncSuccess, handleSyncError, cleanupOrder]
  );
  const syncQueuedOrders = useCallback(async () => {
    if (syncingRef.current) return;
    const now = Date.now();
    if (now - lastSyncTimeRef.current < SYNC_DEBOUNCE_TIME) return;
    syncingRef.current = true;
    lastSyncTimeRef.current = now;
    try {
      const queuedOrders = getQueuedOrders();
      const failedOrders = getFailedOrders();
      const allOrders = [...queuedOrders, ...failedOrders];
      if (allOrders.length === 0) return;
      let syncedCount = 0;
      let failedCount = 0;
      const processedKeys = new Set();
      for (const order of allOrders) {
        if (
          processedKeys.has(order.idempotencyKey) ||
          isOrderProcessed(order.idempotencyKey)
        ) {
          continue;
        }
        processedKeys.add(order.idempotencyKey);
        const result = await processOrderWithRetry(order);
        if (result.success) {
          syncedCount++;
        } else if (!result.skipped) {
          failedCount++;
        }
      }
      if (allOrders.length > 1) {
        if (failedCount === 0) {
          toast.success(`Successfully synced ${syncedCount} orders!`);
        } else if (syncedCount > 0) {
          toast.success(`Synced ${syncedCount} orders, ${failedCount} failed.`);
        }
      }
    } catch (error) {
      toast.error("Sync process encountered an error");
    } finally {
      syncingRef.current = false;
    }
  }, [
    getQueuedOrders,
    getFailedOrders,
    isOrderProcessed,
    processOrderWithRetry,
  ]);
  const syncSingleOrder = useCallback(
    async (idempotencyKey) => {
      const queuedOrders = getQueuedOrders();
      const failedOrders = getFailedOrders();
      const order = [...queuedOrders, ...failedOrders].find(
        (o) => o.idempotencyKey === idempotencyKey
      );
      if (order) {
        await processOrderWithRetry(order);
      }
    },
    [getQueuedOrders, getFailedOrders, processOrderWithRetry]
  );
  useEffect(() => {
    if (syncMode !== "auto") return;
    let timeoutId = null;
    const shouldTriggerSync = () => {
      const now = Date.now();
      if (now - lastTriggerTimeRef.current < TRIGGER_COOLDOWN_TIME) {
        return false;
      }
      if (syncingRef.current) {
        return false;
      }
      const hasOrdersToSync =
        getQueuedOrders().length > 0 || getFailedOrders().length > 0;
      return hasOrdersToSync;
    };
    const triggerSync = () => {
      if (shouldTriggerSync()) {
        lastTriggerTimeRef.current = Date.now();
        timeoutId = setTimeout(syncQueuedOrders, NETWORK_STABILITY_DELAY);
      }
    };
    const handleOnline = () => triggerSync();
    if (isOnline) {
      triggerSync();
    }
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("online", handleOnline);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [syncMode, syncQueuedOrders, isOnline, getQueuedOrders, getFailedOrders]);
  useEffect(() => {
    return () => {
      syncingRef.current = false;
    };
  }, []);
  return {
    syncQueuedOrders,
    syncSingleOrder,
    syncMode,
    isSyncing: syncingRef.current,
  };
}
