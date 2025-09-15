import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createPersistConfig } from "./zustand-storage";

const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
      updateUser: (updates) =>
        set((state) => ({ user: { ...state.user, ...updates } })),
    }),
    createPersistConfig("user-store")
  )
);

export { useUserStore };
