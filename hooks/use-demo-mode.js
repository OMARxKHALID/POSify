import { useDemoModeStore } from "@/components/providers/store-provider";

export const useIsDemoModeEnabled = () => {
  return useDemoModeStore((state) => state.isDemoMode);
};
