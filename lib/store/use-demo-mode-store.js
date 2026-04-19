import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useDemoModeStore = create(
  persist(
    (set) => ({
      isDemoMode: true,
      
      enableDemoMode: () => set({ isDemoMode: true }),
      
      disableDemoMode: () => set({ isDemoMode: false }),
      
      toggleDemoMode: () => set((state) => ({ isDemoMode: !state.isDemoMode })),
    }),
    {
      name: "posify-demo-mode",
      defaultState: { isDemoMode: true },
    }
  )
);