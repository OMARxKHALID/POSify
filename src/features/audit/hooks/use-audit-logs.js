import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppContext } from "@/lib/hooks/use-app-context";
import {
  getDefaultQueryOptions,
  queryKeys,
  createServiceQueryFn,
} from "@/lib/helpers/hook.helpers";
import { mockFallback } from "@/lib/mockup-data";

const buildQueryParams = (filters) => {
  const queryParams = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.append(key, value.toString());
    }
  });

  return queryParams;
};

export const useAuditLogs = (filters = {}, options = {}) => {
  const { userId, isDemoMode } = useAppContext();

  const queryParams = buildQueryParams(filters);
  const queryFn = createServiceQueryFn(
    () => mockFallback.auditLogs(),
    () => mockFallback.auditLogs(),
    isDemoMode,
  );

  return useQuery({
    queryKey: queryKeys.auditLogs(filters, userId),
    queryFn,
    ...getDefaultQueryOptions(options),
  });
};

export const useAuditLogsManagement = (initialFilters = {}) => {
  const [filters, setFilters] = useState(initialFilters);

  const {
    data: auditLogsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useAuditLogs(filters);

  const auditLogs = auditLogsData?.auditLogs || [];
  const pagination = auditLogsData?.pagination || {};
  const appliedFilters = auditLogsData?.filters || {};
  const currentUser = auditLogsData?.currentUser || null;

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const refresh = () => {
    refetch();
  };

  return {
    auditLogs,
    pagination,
    appliedFilters,
    currentUser,
    isLoading,
    isError,
    error,
    updateFilters,
    clearFilters,
    refresh,
    refetch,
  };
};
