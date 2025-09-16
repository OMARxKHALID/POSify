"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  normalizeItem,
  itemsHaveSameId,
  findItemById,
  filterItemsById,
} from "@/lib/utils/common-utils";
import { createPersistConfig } from "./zustand-storage";

// Helper function to clamp discount percentage
const clampDiscountPercentage = (discount) => {
  return Math.max(0, Math.min(100, discount));
};

const useCartStore = create(
  persist(
    (set, get) => ({
      orderItems: [],
      cartDiscount: 0,
      isCartOpen: false,
      addToCart: (item, quantity = 1) =>
        set(({ orderItems }) => {
          const normalizedItem = normalizeItem(item);
          if (!normalizedItem) {
            console.error(
              "🛒 [ERROR] Cart Store - Invalid item provided to addToCart"
            );
            return { orderItems };
          }

          const existing = findItemById(orderItems, normalizedItem._id);

          if (existing) {
            return {
              orderItems: orderItems.map((i) =>
                itemsHaveSameId(i, normalizedItem)
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          } else {
            return {
              orderItems: [...orderItems, { ...normalizedItem, quantity }],
            };
          }
        }),
      updateQuantity: (id, quantity) =>
        set(({ orderItems }) => ({
          orderItems:
            quantity <= 0
              ? filterItemsById(orderItems, id)
              : orderItems.map((item) =>
                  item._id === id ? { ...item, quantity } : item
                ),
        })),
      removeFromCart: (id) =>
        set(({ orderItems }) => ({
          orderItems: filterItemsById(orderItems, id),
        })),
      clearCart: () => set({ orderItems: [], cartDiscount: 0 }),
      applyItemDiscount: (id, discount) =>
        set(({ orderItems }) => ({
          orderItems: orderItems.map((item) =>
            itemsHaveSameId(item, id)
              ? { ...item, discount: clampDiscountPercentage(discount) }
              : item
          ),
        })),
      applyCartDiscount: (discount) =>
        set({
          cartDiscount: clampDiscountPercentage(discount),
        }),
      removeItemDiscount: (id) =>
        set(({ orderItems }) => ({
          orderItems: orderItems.map((item) =>
            itemsHaveSameId(item, id) ? { ...item, discount: 0 } : item
          ),
        })),
      removeCartDiscount: () => set({ cartDiscount: 0 }),
      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      getTotalItems: () => get().orderItems.length,
      getTotalQuantity: () =>
        get().orderItems.reduce((sum, item) => sum + (item.quantity || 0), 0),
    }),
    createPersistConfig("cart-store")
  )
);

export { useCartStore };
