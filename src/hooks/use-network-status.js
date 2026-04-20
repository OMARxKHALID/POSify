import { useEffect, useState } from "react";
import { useIsDemoModeEnabled } from "@/features/settings/hooks/use-demo-mode";

export function useNetworkStatus() {
  const isDemoMode = useIsDemoModeEnabled();
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);


    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);



    const checkNetwork = async () => {
      if (isDemoMode) {
        setIsOnline(navigator.onLine);
        return;
      }
      try {
        const response = await fetch(`/api/health?t=${Date.now()}`, {
          method: "HEAD",
          cache: "no-store",
        });
        const online = response.ok || response.status === 404;
        setIsOnline((prev) => (prev !== online ? online : prev));
      } catch {
        setIsOnline((prev) => (prev ? false : prev));
      }
    };


    checkNetwork();



    const interval = setInterval(() => {


      if (navigator.onLine !== isOnline || !isDemoMode) {
        checkNetwork();
      }
    }, 10000); 

    return () => {
      clearInterval(interval);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [isOnline, isDemoMode]);

  return {
    isOnline,
  };
}
