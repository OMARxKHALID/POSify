import { apiClient } from "@/lib/api-client";
import { useEffect, useState, useRef } from "react";

let networkStatusInstance = null;
let listeners = new Set();
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [networkType, setNetworkType] = useState("unknown");
  const prevOnlineStatus = useRef(isOnline);
  useEffect(() => {
    if (networkStatusInstance) {
      const updateState = (online, type) => {
        setIsOnline(online);
        setNetworkType(type);
      };
      listeners.add(updateState);
      return () => {
        listeners.delete(updateState);
      };
    }
    networkStatusInstance = {
      isOnline: isOnline,
      networkType: networkType,
    };
    const handleOnline = () => {
      const newOnline = true;
      setIsOnline(newOnline);
      networkStatusInstance.isOnline = newOnline;
      listeners.forEach((listener) =>
        listener(newOnline, networkStatusInstance.networkType)
      );
      setTimeout(() => {
        if (navigator.connection) {
          const newType = navigator.connection.effectiveType || "unknown";
          setNetworkType(newType);
          networkStatusInstance.networkType = newType;
          listeners.forEach((listener) => listener(newOnline, newType));
        }
      }, 500);
    };
    const handleOffline = () => {
      const newOnline = false;
      const newType = "offline";
      setIsOnline(newOnline);
      setNetworkType(newType);
      networkStatusInstance.isOnline = newOnline;
      networkStatusInstance.networkType = newType;
      listeners.forEach((listener) => listener(newOnline, newType));
    };
    if (navigator.connection) {
      const initialType = navigator.connection.effectiveType || "unknown";
      setNetworkType(initialType);
      networkStatusInstance.networkType = initialType;
    }
    const checkNetworkStatus = () => {
      const currentOnlineStatus = navigator.onLine;
      if (currentOnlineStatus !== prevOnlineStatus.current) {
        setIsOnline(currentOnlineStatus);
        networkStatusInstance.isOnline = currentOnlineStatus;
        prevOnlineStatus.current = currentOnlineStatus;
        listeners.forEach((listener) =>
          listener(currentOnlineStatus, networkStatusInstance.networkType)
        );
        if (!currentOnlineStatus) {
          const newType = "offline";
          setNetworkType(newType);
          networkStatusInstance.networkType = newType;
          listeners.forEach((listener) =>
            listener(currentOnlineStatus, newType)
          );
        }
      }
    };
    const testNetworkConnectivity = async () => {
      try {
        await apiClient.get("/health");
      } catch (error) {
        const newOnline = false;
        const newType = "offline";
        setIsOnline(newOnline);
        setNetworkType(newType);
        networkStatusInstance.isOnline = newOnline;
        networkStatusInstance.networkType = newType;
        listeners.forEach((listener) => listener(newOnline, newType));
      }
    };
    const intervalId = setInterval(checkNetworkStatus, 2000);
    const connectivityIntervalId = setInterval(testNetworkConnectivity, 10000);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(intervalId);
      clearInterval(connectivityIntervalId);
      if (listeners.size === 0) {
        networkStatusInstance = null;
      }
    };
  }, []);
  return {
    isOnline,
    networkType,
    isSlowConnection:
      networkType === "slow-2g" || networkType === "2g" || networkType === "3g",
  };
}
