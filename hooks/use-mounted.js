import { useState, useEffect } from "react";

/**
 * Hook to detect if component is mounted (client-side)
 * Useful for preventing hydration mismatches
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
