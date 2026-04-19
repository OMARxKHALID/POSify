import { createStore } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { createPersistConfig } from "./zustand-storage";

export const createDemoModeStore = (initState = {}) => {
  return createStore()(
    devtools(
      persist(
        immer((set) => ({
          isDemoMode: true,
          ...initState,

          enableDemoMode: () =>
            set((state) => {
              state.isDemoMode = true;
            }),

          disableDemoMode: () =>
            set((state) => {
              state.isDemoMode = false;
            }),

          toggleDemoMode: () =>
            set((state) => {
              state.isDemoMode = !state.isDemoMode;
            }),
        })),
        createPersistConfig("posify-demo-mode")
      ),
      { name: "DemoModeStore" }
    )
  );
};