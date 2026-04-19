"use client";

import { createContext, useContext, useRef } from "react";
import { useStore } from "zustand";
import { createCartStore } from "@/features/pos/stores/cart.store";
import { createOrderQueueStore } from "@/features/pos/stores/queue-order.store";
import { createDemoModeStore } from "@/features/settings/stores/demo-mode.store";

export const StoreContext = createContext(null);

export const StoreProvider = ({ children }) => {
  const storesRef = useRef();
  if (!storesRef.current) {
    storesRef.current = {
      cartStore: createCartStore(),
      orderQueueStore: createOrderQueueStore(),
      demoModeStore: createDemoModeStore(),
    };
  }

  return (
    <StoreContext.Provider value={storesRef.current}>
      {children}
    </StoreContext.Provider>
  );
};

export const useCartStore = (selector) => {
  const context = useContext(StoreContext);
  if (!context)
    throw new Error("useCartStore must be used within StoreProvider");
  return useStore(context.cartStore, selector);
};

export const useOrderQueueStore = (selector) => {
  const context = useContext(StoreContext);
  if (!context)
    throw new Error("useOrderQueueStore must be used within StoreProvider");
  return useStore(context.orderQueueStore, selector);
};

export const useDemoModeStore = (selector) => {
  const context = useContext(StoreContext);
  if (!context)
    throw new Error("useDemoModeStore must be used within StoreProvider");
  return useStore(context.demoModeStore, selector);
};
