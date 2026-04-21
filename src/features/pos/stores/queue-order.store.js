import { createStore } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { createPersistConfig } from "@/lib/utils/zustand-storage";

const ORDER_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
};

const MAX_RETRY_COUNT = 3;

export const createOrderQueueStore = (initState = {}) => {
  return createStore()(
    devtools(
      persist(
        immer((set, get) => ({
          queuedOrders: [],
          processedKeys: [],
          ...initState,

          _hasKey: (orders, idempotencyKey) =>
            orders.some((order) => order.idempotencyKey === idempotencyKey),

          addOrder: (order) => {
            if (!order?.idempotencyKey) {
              throw new Error("Order must have an idempotencyKey");
            }
            const { queuedOrders } = get();
            if (!get()._hasKey(queuedOrders, order.idempotencyKey)) {
              set((state) => {
                state.queuedOrders.push({
                  ...order,
                  _status: ORDER_STATUS.PENDING,
                  _createdAt: Date.now(),
                  _retryCount: 0,
                  _lastAttempt: null,
                  _error: null,
                });
              });
            }
          },

          removeOrder: (idempotencyKey) => {
            if (!idempotencyKey) return;
            set((state) => {
              state.queuedOrders = state.queuedOrders.filter(
                (o) => o.idempotencyKey !== idempotencyKey
              );
              if (!state.processedKeys.includes(idempotencyKey)) {
                state.processedKeys.push(idempotencyKey);
              }
            });
          },

          markProcessing: (idempotencyKey) => {
            if (!idempotencyKey) return;
            set((state) => {
              const order = state.queuedOrders.find(
                (o) => o.idempotencyKey === idempotencyKey
              );
              if (order) {
                order._status = ORDER_STATUS.PROCESSING;
                order._lastAttempt = Date.now();
              }
            });
          },

          markCompleted: (idempotencyKey) => {
            if (!idempotencyKey) return;
            set((state) => {
              state.queuedOrders = state.queuedOrders.filter(
                (o) => o.idempotencyKey !== idempotencyKey
              );
              if (!state.processedKeys.includes(idempotencyKey)) {
                state.processedKeys.push(idempotencyKey);
              }
            });
          },

          markFailed: (idempotencyKey, error) => {
            if (!idempotencyKey) return;
            set((state) => {
              const order = state.queuedOrders.find(
                (o) => o.idempotencyKey === idempotencyKey
              );
              if (order) {
                order._status = ORDER_STATUS.FAILED;
                order._error = error?.message || String(error);
                order._retryCount += 1;
              }
            });
          },

          canRetry: (idempotencyKey) => {
            const order = get().queuedOrders.find(
              (o) => o.idempotencyKey === idempotencyKey
            );
            if (!order) return false;
            return order._retryCount < MAX_RETRY_COUNT;
          },

          clearQueue: () =>
            set((state) => {
              state.queuedOrders = [];
            }),

          clearProcessed: () =>
            set((state) => {
              state.processedKeys = [];
            }),

          clearAll: () =>
            set((state) => {
              state.queuedOrders = [];
              state.processedKeys = [];
            }),

          addMultipleOrders: (orders) => {
            if (!Array.isArray(orders)) return;
            set((state) => {
              orders.forEach((order) => {
                if (
                  order?.idempotencyKey &&
                  !state.queuedOrders.some(
                    (o) => o.idempotencyKey === order.idempotencyKey
                  )
                ) {
                  state.queuedOrders.push({
                    ...order,
                    _status: ORDER_STATUS.PENDING,
                    _createdAt: Date.now(),
                    _retryCount: 0,
                    _lastAttempt: null,
                    _error: null,
                  });
                }
              });
            });
          },

          removeMultipleOrders: (idempotencyKeys) => {
            if (!Array.isArray(idempotencyKeys)) return;
            set((state) => {
              const keysSet = new Set(idempotencyKeys);
              state.queuedOrders = state.queuedOrders.filter(
                (order) => !keysSet.has(order.idempotencyKey)
              );
              idempotencyKeys.forEach((key) => {
                if (!state.processedKeys.includes(key)) {
                  state.processedKeys.push(key);
                }
              });
            });
          },

          getQueueStats: () => {
            const { queuedOrders, processedKeys } = get();
            const pending = queuedOrders.filter(
              (o) => o._status === ORDER_STATUS.PENDING
            ).length;
            const processing = queuedOrders.filter(
              (o) => o._status === ORDER_STATUS.PROCESSING
            ).length;
            const failed = queuedOrders.filter(
              (o) => o._status === ORDER_STATUS.FAILED
            ).length;
            return {
              pending,
              processing,
              failed,
              processed: processedKeys.length,
              total: queuedOrders.length + processedKeys.length,
            };
          },

          getOrderStatus: (idempotencyKey) => {
            const { processedKeys, queuedOrders } = get();
            if (processedKeys.includes(idempotencyKey)) return "completed";
            const order = queuedOrders.find(
              (o) => o.idempotencyKey === idempotencyKey
            );
            if (!order) return "not_found";
            return order._status;
          },

          isProcessed: (idempotencyKey) => {
            return get().processedKeys.includes(idempotencyKey);
          },

          isQueued: (idempotencyKey) => {
            return get()._hasKey(get().queuedOrders, idempotencyKey);
          },
        })),
        {
          ...createPersistConfig("order-queue"),
          partialize: (state) => ({
            queuedOrders: state.queuedOrders.map((order) => ({
              idempotencyKey: order.idempotencyKey,
              _status: order._status,
              _createdAt: order._createdAt,
              _retryCount: order._retryCount,
              _lastAttempt: order._lastAttempt,
              _error: order._error,
              organizationId: order.organizationId,
              items: order.items,
              subtotal: order.subtotal,
              total: order.total,
              customerName: order.customerName,
              paymentMethod: order.paymentMethod,
              deliveryType: order.deliveryType,
              tax: order.tax,
              discount: order.discount,
              tip: order.tip,
            })),
            processedKeys: state.processedKeys,
          }),
        }
      ),
      { name: "OrderQueueStore" }
    )
  );
};

export const ORDER_STATUS_ENUM = ORDER_STATUS;
