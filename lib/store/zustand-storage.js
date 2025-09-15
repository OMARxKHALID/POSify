import { createJSONStorage } from "zustand/middleware";

export const createSSRSafeStorage = (storageName) => {
  return createJSONStorage(() => {
    if (typeof window !== "undefined") {
      return localStorage;
    }
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  });
};

export const createPersistConfig = (storageName) => ({
  name: storageName,
  storage: createSSRSafeStorage(storageName),
});
