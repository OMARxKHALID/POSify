import { useEffect, useState } from "react";

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    // Browser event handlers - primary detection method
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Listen to browser events
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Only check network when browser events might be unreliable
    // This happens in dev tools offline mode
    const checkNetwork = async () => {
      try {
        const response = await fetch(`/api/health?t=${Date.now()}`, {
          method: "HEAD",
          cache: "no-store",
        });
        const online = response.ok;
        setIsOnline((prev) => (prev !== online ? online : prev));
      } catch {
        // Only set offline if we're currently online
        setIsOnline((prev) => (prev ? false : prev));
      }
    };

    // Check immediately on mount
    checkNetwork();

    // Check periodically to catch cases where browser events don't work
    // This catches dev tools offline mode and reconnection
    const interval = setInterval(() => {
      // Only check if navigator.onLine doesn't match our state
      // This catches dev tools offline mode
      if (navigator.onLine !== isOnline) {
        checkNetwork();
      }
    }, 10000); // Check every 10 seconds

    return () => {
      clearInterval(interval);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [isOnline]);

  return {
    isOnline,
  };
}
