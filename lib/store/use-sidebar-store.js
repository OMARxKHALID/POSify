import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createPersistConfig } from "./zustand-storage";

const useAdminSidebarStore = create(
  persist(
    (set) => ({
      open: false,
      setOpen: (open) => set({ open }),
      toggle: () => set((state) => ({ open: !state.open })),
    }),
    createPersistConfig("admin-sidebar-store")
  )
);

export { useAdminSidebarStore };
