import { useEffect, useRef, useCallback, useState } from "react";
import { useOrderQueueStore } from "@/components/providers/store-provider";
import { useShallow } from "zustand/react/shallow";
import { toast } from "sonner";
import { useCreateOrder } from "@/features/pos/hooks/use-orders";
import { useSettings } from "@/features/settings/hooks/use-settings";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { ORDER_STATUS_ENUM } from "../stores/queue-order.store";

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
    message.includes(keyword),
  );
};

const isValidOrder = (order) => {
  return order?.idempotencyKey && order?.items?.length > 0;
};

export function useOrderQueueSync() {
  const {
    removeOrder,
    markFailed,
    markProcessing,
    markCompleted,
    canRetry,
    queuedOrders,
    getOrderStatus,
    isProcessed,
  } = useOrderQueueStore(
    useShallow((state) => ({
      removeOrder: state.removeOrder,
      markFailed: state.markFailed,
      markProcessing: state.markProcessing,
      markCompleted: state.markCompleted,
      canRetry: state.canRetry,
      queuedOrders: state.queuedOrders,
      getOrderStatus: state.getOrderStatus,
      isProcessed: state.isProcessed,
    })),
  );

  const getPendingOrders = useCallback(
    () => queuedOrders.filter((o) => o._status === ORDER_STATUS_ENUM.PENDING),
    [queuedOrders],
  );

  const getFailedOrders = useCallback(
    () => queuedOrders.filter((o) => o._status === ORDER_STATUS_ENUM.FAILED),
    [queuedOrders],
  );

  const isOrderProcessed = useCallback(
    (key) => isProcessed(key) || getOrderStatus(key) === ORDER_STATUS_ENUM.COMPLETED,
    [isProcessed, getOrderStatus],
  );

  const createOrder = useCreateOrder();
  const { settings } = useSettings();
  const { isOnline } = useNetworkStatus();
  const syncMode = settings?.operational?.syncMode || "auto";
  const syncingRef = useRef(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const lastSyncTimeRef = useRef(0);
  const lastTriggerTimeRef = useRef(0);

  const cleanupOrder = useCallback(
    (idempotencyKey) => {
      removeOrder(idempotencyKey);
    },
    [removeOrder],
  );

  const showSyncToast = useCallback(
    (order, created = true, totalPending = 0) => {
      if (totalPending <= 1) {
        toast.success(created ? "Order synced!" : "Order already synced.", {
          id: order.idempotencyKey,
        });
      }
    },
    [],
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
      markCompleted(order.idempotencyKey);
      const totalPending = getPendingOrders().length + getFailedOrders().length;
      showSyncToast(order, created, totalPending);
    },
    [markCompleted, getPendingOrders, getFailedOrders, showSyncToast],
  );

  const handleSyncError = useCallback(
    (order, error) => {
      if (isDuplicateError(error)) {
        handleSyncSuccess(order, false);
        return;
      }
      const message = error?.message || error?.toString() || "Unknown error";
      markFailed(order.idempotencyKey, { message });
      showErrorToast(order, error);
    },
    [markFailed, handleSyncSuccess, showErrorToast],
  );

  const processOrderWithRetry = useCallback(
    async (order) => {
      if (!isValidOrder(order)) {
        cleanupOrder(order.idempotencyKey);
        return { success: false, skipped: true };
      }

      markProcessing(order.idempotencyKey);

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
              setTimeout(resolve, RETRY_DELAY * (attempt + 1)),
            );
            continue;
          }
          handleSyncError(order, error);
          return { success: false, error };
        }
      }
    },
    [createOrder, handleSyncSuccess, handleSyncError, cleanupOrder, markProcessing],
  );

  const syncQueuedOrders = useCallback(async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    setIsSyncing(true);
    const now = Date.now();
    if (now - lastSyncTimeRef.current < SYNC_DEBOUNCE_TIME) return;
    lastSyncTimeRef.current = now;

    try {
      const pendingOrders = getPendingOrders();
      const failedOrders = getFailedOrders();
      const allOrders = [...pendingOrders, ...failedOrders];

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

        const shouldRetry = order._status === ORDER_STATUS_ENUM.FAILED
          ? canRetry(order.idempotencyKey)
          : true;

        if (!shouldRetry) {
          failedCount++;
          continue;
        }

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
      setIsSyncing(false);
    }
  }, [
    getPendingOrders,
    getFailedOrders,
    isOrderProcessed,
    processOrderWithRetry,
    canRetry,
  ]);

  const syncSingleOrder = useCallback(
    async (idempotencyKey) => {
      const pendingOrders = getPendingOrders();
      const failedOrders = getFailedOrders();
      const order = [...pendingOrders, ...failedOrders].find(
        (o) => o.idempotencyKey === idempotencyKey,
      );
      if (order) {
        await processOrderWithRetry(order);
      }
    },
    [getPendingOrders, getFailedOrders, processOrderWithRetry],
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
        getPendingOrders().length > 0 || getFailedOrders().length > 0;
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
  }, [syncMode, syncQueuedOrders, isOnline, getPendingOrders, getFailedOrders]);

  useEffect(() => {
    return () => {
      syncingRef.current = false;
    };
  }, []);

  return {
    syncQueuedOrders,
    syncSingleOrder,
    syncMode,
    isSyncing,
  };
}
