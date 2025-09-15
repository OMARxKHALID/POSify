import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createPersistConfig } from "./zustand-storage";

const useOrderQueueStore = create(
  persist(
    (set, get) => ({
      queuedOrders: [],
      failedOrders: [],
      processedOrders: [],
      _orderExists: (orders, idempotencyKey) =>
        orders.some((order) => order.idempotencyKey === idempotencyKey),
      _addOrderWithTimestamp: (order, timestamp = Date.now()) => ({
        ...order,
        queuedAt: timestamp,
      }),
      _addFailedOrderWithTimestamp: (order, error, timestamp = Date.now()) => ({
        ...order,
        error,
        failedAt: timestamp,
      }),
      addOrder: (order) => {
        if (!order?.idempotencyKey) {
          throw new Error("Order must have an idempotencyKey");
        }
        const { queuedOrders, _orderExists, _addOrderWithTimestamp } = get();
        if (!_orderExists(queuedOrders, order.idempotencyKey)) {
          set({
            queuedOrders: [...queuedOrders, _addOrderWithTimestamp(order)],
          });
        }
      },
      removeOrder: (idempotencyKey) => {
        if (!idempotencyKey) return;
        const { queuedOrders, processedOrders } = get();
        const orderExists = queuedOrders.some(
          (o) => o.idempotencyKey === idempotencyKey
        );
        if (orderExists) {
          set({
            queuedOrders: queuedOrders.filter(
              (order) => order.idempotencyKey !== idempotencyKey
            ),
            processedOrders: [...new Set([...processedOrders, idempotencyKey])],
          });
        }
      },
      addFailedOrder: (order, error) => {
        if (!order?.idempotencyKey) {
          throw new Error("Failed order must have an idempotencyKey");
        }
        const {
          failedOrders,
          queuedOrders,
          _orderExists,
          _addFailedOrderWithTimestamp,
        } = get();
        const updatedQueuedOrders = queuedOrders.filter(
          (queuedOrder) => queuedOrder.idempotencyKey !== order.idempotencyKey
        );
        if (!_orderExists(failedOrders, order.idempotencyKey)) {
          set({
            failedOrders: [
              ...failedOrders,
              _addFailedOrderWithTimestamp(order, error),
            ],
            queuedOrders: updatedQueuedOrders,
          });
        } else {
          set({ queuedOrders: updatedQueuedOrders });
        }
      },
      removeFailedOrder: (idempotencyKey) => {
        if (!idempotencyKey) return;
        const { failedOrders, processedOrders } = get();
        const orderExists = failedOrders.some(
          (o) => o.idempotencyKey === idempotencyKey
        );
        if (orderExists) {
          set({
            failedOrders: failedOrders.filter(
              (order) => order.idempotencyKey !== idempotencyKey
            ),
            processedOrders: [...new Set([...processedOrders, idempotencyKey])],
          });
        }
      },
      retryFailedOrder: (idempotencyKey) => {
        const { failedOrders, queuedOrders, _addOrderWithTimestamp } = get();
        const failedOrder = failedOrders.find(
          (order) => order.idempotencyKey === idempotencyKey
        );
        if (failedOrder) {
          const { error, failedAt, ...orderData } = failedOrder;
          set({
            failedOrders: failedOrders.filter(
              (order) => order.idempotencyKey !== idempotencyKey
            ),
            queuedOrders: [...queuedOrders, _addOrderWithTimestamp(orderData)],
          });
        }
      },
      clearQueue: () => set({ queuedOrders: [] }),
      clearFailedOrders: () => set({ failedOrders: [] }),
      clearProcessedOrders: () => set({ processedOrders: [] }),
      clearAllOrders: () =>
        set({
          queuedOrders: [],
          failedOrders: [],
          processedOrders: [],
        }),
      addMultipleOrders: (orders) => {
        if (!Array.isArray(orders)) return;
        const { queuedOrders, _orderExists, _addOrderWithTimestamp } = get();
        const validOrders = orders.filter(
          (order) =>
            order?.idempotencyKey &&
            !_orderExists(queuedOrders, order.idempotencyKey)
        );
        if (validOrders.length > 0) {
          set({
            queuedOrders: [
              ...queuedOrders,
              ...validOrders.map((order) => _addOrderWithTimestamp(order)),
            ],
          });
        }
      },
      removeMultipleOrders: (idempotencyKeys) => {
        if (!Array.isArray(idempotencyKeys)) return;
        const { queuedOrders, processedOrders } = get();
        const keysSet = new Set(idempotencyKeys);
        set({
          queuedOrders: queuedOrders.filter(
            (order) => !keysSet.has(order.idempotencyKey)
          ),
          processedOrders: [
            ...new Set([...processedOrders, ...idempotencyKeys]),
          ],
        });
      },
      getQueuedOrders: () => get().queuedOrders,
      getFailedOrders: () => get().failedOrders,
      getProcessedOrders: () => get().processedOrders,
      getTotalPendingOrders: () => {
        const { queuedOrders, failedOrders } = get();
        return queuedOrders.length + failedOrders.length;
      },
      isOrderProcessed: (idempotencyKey) => {
        const { processedOrders } = get();
        return processedOrders.includes(idempotencyKey);
      },
      isOrderQueued: (idempotencyKey) => {
        const { queuedOrders } = get();
        return queuedOrders.some(
          (order) => order.idempotencyKey === idempotencyKey
        );
      },
      isOrderFailed: (idempotencyKey) => {
        const { failedOrders } = get();
        return failedOrders.some(
          (order) => order.idempotencyKey === idempotencyKey
        );
      },
      getOrderStatus: (idempotencyKey) => {
        const state = get();
        if (state.processedOrders.includes(idempotencyKey)) {
          return "processed";
        }
        if (
          state.queuedOrders.some((o) => o.idempotencyKey === idempotencyKey)
        ) {
          return "queued";
        }
        if (
          state.failedOrders.some((o) => o.idempotencyKey === idempotencyKey)
        ) {
          return "failed";
        }
        return "not_found";
      },
      getQueueStats: () => {
        const { queuedOrders, failedOrders, processedOrders } = get();
        return {
          queued: queuedOrders.length,
          failed: failedOrders.length,
          processed: processedOrders.length,
          total:
            queuedOrders.length + failedOrders.length + processedOrders.length,
        };
      },
    }),
    createPersistConfig("order-queue")
  )
);

export { useOrderQueueStore };

export const getQueuedOrders = () =>
  useOrderQueueStore.getState().getQueuedOrders();

export const getFailedOrders = () =>
  useOrderQueueStore.getState().getFailedOrders();

export const getProcessedOrders = () =>
  useOrderQueueStore.getState().getProcessedOrders();

export const getTotalPendingOrders = () =>
  useOrderQueueStore.getState().getTotalPendingOrders();

export const getQueueStats = () =>
  useOrderQueueStore.getState().getQueueStats();

export const addOrderToQueue = (order) =>
  useOrderQueueStore.getState().addOrder(order);

export const addMultipleOrdersToQueue = (orders) =>
  useOrderQueueStore.getState().addMultipleOrders(orders);

export const removeOrderFromQueue = (idempotencyKey) =>
  useOrderQueueStore.getState().removeOrder(idempotencyKey);

export const removeMultipleOrdersFromQueue = (idempotencyKeys) =>
  useOrderQueueStore.getState().removeMultipleOrders(idempotencyKeys);

export const retryFailedOrder = (idempotencyKey) =>
  useOrderQueueStore.getState().retryFailedOrder(idempotencyKey);

export const clearOrderQueue = () => useOrderQueueStore.getState().clearQueue();

export const clearFailedOrders = () =>
  useOrderQueueStore.getState().clearFailedOrders();

export const clearProcessedOrders = () =>
  useOrderQueueStore.getState().clearProcessedOrders();

export const clearAllOrders = () =>
  useOrderQueueStore.getState().clearAllOrders();

export const getOrderStatus = (idempotencyKey) =>
  useOrderQueueStore.getState().getOrderStatus(idempotencyKey);

export const isOrderProcessed = (idempotencyKey) =>
  useOrderQueueStore.getState().isOrderProcessed(idempotencyKey);

export const isOrderQueued = (idempotencyKey) =>
  useOrderQueueStore.getState().isOrderQueued(idempotencyKey);

export const isOrderFailed = (idempotencyKey) =>
  useOrderQueueStore.getState().isOrderFailed(idempotencyKey);
