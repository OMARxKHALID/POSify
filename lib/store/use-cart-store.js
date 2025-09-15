"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
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
          const id = item._id || item.id;
          const existing = orderItems.find((i) => (i._id || i.id) === id);
          if (existing) {
            return {
              orderItems: orderItems.map((i) =>
                (i._id || i.id) === id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          } else {
            return {
              orderItems: [...orderItems, { ...item, _id: id, quantity }],
            };
          }
        }),
      updateQuantity: (id, quantity) =>
        set(({ orderItems }) => ({
          orderItems:
            quantity <= 0
              ? orderItems.filter((item) => (item._id || item.id) !== id)
              : orderItems.map((item) =>
                  (item._id || item.id) === id ? { ...item, quantity } : item
                ),
        })),
      removeFromCart: (id) =>
        set(({ orderItems }) => ({
          orderItems: orderItems.filter((item) => (item._id || item.id) !== id),
        })),
      clearCart: () => set({ orderItems: [], cartDiscount: 0 }),
      applyItemDiscount: (id, discount) =>
        set(({ orderItems }) => ({
          orderItems: orderItems.map((item) =>
            (item._id || item.id) === id
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
            (item._id || item.id) === id ? { ...item, discount: 0 } : item
          ),
        })),
      removeCartDiscount: () => set({ cartDiscount: 0 }),
      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      getTotalItems: () => get().orderItems.length,
      getTotalQuantity: () =>
        get().orderItems.reduce((sum, item) => sum + item.quantity, 0),
    }),
    createPersistConfig("cart-store")
  )
);

export { useCartStore };
