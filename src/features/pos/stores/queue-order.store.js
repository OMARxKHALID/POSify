import { createStore } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { createPersistConfig } from "@/lib/utils/zustand-storage";

export const createOrderQueueStore = (initState = {}) => {
  return createStore()(
    devtools(
      persist(
        immer((set, get) => ({
          queuedOrders: [],
          failedOrders: [],
          processedOrders: [],
          ...initState,

          _orderExists: (orders, idempotencyKey) =>
            orders.some((order) => order.idempotencyKey === idempotencyKey),

          addOrder: (order) => {
            if (!order?.idempotencyKey) {
              throw new Error("Order must have an idempotencyKey");
            }
            const { queuedOrders, _orderExists } = get();
            if (!_orderExists(queuedOrders, order.idempotencyKey)) {
              set((state) => {
                state.queuedOrders.push({ ...order, queuedAt: Date.now() });
              });
            }
          },

          removeOrder: (idempotencyKey) => {
            if (!idempotencyKey) return;
            set((state) => {
              const orderIndex = state.queuedOrders.findIndex(
                (o) => o.idempotencyKey === idempotencyKey
              );
              if (orderIndex !== -1) {
                state.queuedOrders.splice(orderIndex, 1);
                if (!state.processedOrders.includes(idempotencyKey)) {
                  state.processedOrders.push(idempotencyKey);
                }
              }
            });
          },

          addFailedOrder: (order, error) => {
            if (!order?.idempotencyKey) {
              throw new Error("Failed order must have an idempotencyKey");
            }
            set((state) => {
              state.queuedOrders = state.queuedOrders.filter(
                (o) => o.idempotencyKey !== order.idempotencyKey
              );
              const exists = state.failedOrders.some(
                (o) => o.idempotencyKey === order.idempotencyKey
              );
              if (!exists) {
                state.failedOrders.push({
                  ...order,
                  error,
                  failedAt: Date.now(),
                });
              }
            });
          },

          removeFailedOrder: (idempotencyKey) => {
            if (!idempotencyKey) return;
            set((state) => {
              const orderIndex = state.failedOrders.findIndex(
                (o) => o.idempotencyKey === idempotencyKey
              );
              if (orderIndex !== -1) {
                state.failedOrders.splice(orderIndex, 1);
                if (!state.processedOrders.includes(idempotencyKey)) {
                  state.processedOrders.push(idempotencyKey);
                }
              }
            });
          },

          retryFailedOrder: (idempotencyKey) => {
            set((state) => {
              const failedOrder = state.failedOrders.find(
                (o) => o.idempotencyKey === idempotencyKey
              );
              if (failedOrder) {
                const { error, failedAt, ...orderData } = failedOrder;
                state.failedOrders = state.failedOrders.filter(
                  (o) => o.idempotencyKey !== idempotencyKey
                );
                state.queuedOrders.push({ ...orderData, queuedAt: Date.now() });
              }
            });
          },

          clearQueue: () =>
            set((state) => {
              state.queuedOrders = [];
            }),
          clearFailedOrders: () =>
            set((state) => {
              state.failedOrders = [];
            }),
          clearProcessedOrders: () =>
            set((state) => {
              state.processedOrders = [];
            }),
          clearAllOrders: () =>
            set((state) => {
              state.queuedOrders = [];
              state.failedOrders = [];
              state.processedOrders = [];
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
                  state.queuedOrders.push({ ...order, queuedAt: Date.now() });
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
                if (!state.processedOrders.includes(key)) {
                  state.processedOrders.push(key);
                }
              });
            });
          },

          getQueueStats: () => {
            const { queuedOrders, failedOrders, processedOrders } = get();
            return {
              queued: queuedOrders.length,
              failed: failedOrders.length,
              processed: processedOrders.length,
              total:
                queuedOrders.length +
                failedOrders.length +
                processedOrders.length,
            };
          },

          getOrderStatus: (idempotencyKey) => {
            const { processedOrders, queuedOrders, failedOrders } = get();
            if (processedOrders.includes(idempotencyKey)) return "processed";
            if (queuedOrders.some((o) => o.idempotencyKey === idempotencyKey))
              return "queued";
            if (failedOrders.some((o) => o.idempotencyKey === idempotencyKey))
              return "failed";
            return "not_found";
          },
        })),
        createPersistConfig("order-queue")
      ),
      { name: "OrderQueueStore" }
    )
  );
};
