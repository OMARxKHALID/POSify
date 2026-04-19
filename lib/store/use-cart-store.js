import { createStore } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import {
  normalizeItem,
  itemsHaveSameId,
  findItemById,
  filterItemsById,
} from "@/lib/utils/common-utils";
import { createPersistConfig } from "./zustand-storage";

const clampDiscountPercentage = (discount) => {
  return Math.max(0, Math.min(100, discount));
};

export const createCartStore = (initState = {}) => {
  return createStore()(
    devtools(
      persist(
        immer((set, get) => ({
          orderItems: [],
          cartDiscount: 0,
          isCartOpen: false,
          ...initState,

          addToCart: (item, quantity = 1) =>
            set((state) => {
              const normalizedItem = normalizeItem(item);
              if (!normalizedItem) return;

              const existing = state.orderItems.find(
                (i) => i._id === normalizedItem._id
              );

              if (existing) {
                existing.quantity += quantity;
              } else {
                state.orderItems.push({ ...normalizedItem, quantity });
              }
            }),

          updateQuantity: (id, quantity) =>
            set((state) => {
              if (quantity <= 0) {
                state.orderItems = state.orderItems.filter((i) => i._id !== id);
              } else {
                const item = state.orderItems.find((i) => i._id === id);
                if (item) item.quantity = quantity;
              }
            }),

          removeFromCart: (id) =>
            set((state) => {
              state.orderItems = state.orderItems.filter((i) => i._id !== id);
            }),

          clearCart: () =>
            set((state) => {
              state.orderItems = [];
              state.cartDiscount = 0;
            }),

          applyItemDiscount: (id, discount) =>
            set((state) => {
              const item = state.orderItems.find((i) => itemsHaveSameId(i, id));
              if (item) item.discount = clampDiscountPercentage(discount);
            }),

          applyCartDiscount: (discount) =>
            set((state) => {
              state.cartDiscount = clampDiscountPercentage(discount);
            }),

          removeItemDiscount: (id) =>
            set((state) => {
              const item = state.orderItems.find((i) => itemsHaveSameId(i, id));
              if (item) item.discount = 0;
            }),

          removeCartDiscount: () =>
            set((state) => {
              state.cartDiscount = 0;
            }),

          openCart: () =>
            set((state) => {
              state.isCartOpen = true;
            }),

          closeCart: () =>
            set((state) => {
              state.isCartOpen = false;
            }),

          toggleCart: () =>
            set((state) => {
              state.isCartOpen = !state.isCartOpen;
            }),

          getTotalItems: () => get().orderItems.length,
          getTotalQuantity: () =>
            get().orderItems.reduce((sum, item) => sum + (item.quantity || 0), 0),
        })),
        createPersistConfig("cart-store")
      ),
      { name: "CartStore" }
    )
  );
};
