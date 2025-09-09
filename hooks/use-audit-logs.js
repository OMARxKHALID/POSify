/**
 * useAuditLogs Hook
 * Custom hook for fetching audit logs data using TanStack React Query
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { getDefaultQueryOptions, queryKeys } from "@/lib/hooks/hook-utils";

/**
 * Build query parameters from filters
 */
const buildQueryParams = (filters) => {
  const queryParams = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.append(key, value.toString());
    }
  });

  return queryParams;
};

/**
 * Hook to fetch audit logs with filtering and pagination
 */
export const useAuditLogs = (filters = {}, options = {}) => {
  const queryOptions = getDefaultQueryOptions({
    staleTime: 2 * 60 * 1000, // 2 minutes (shorter than users since audit logs change more frequently)
    ...options,
  });

  return useQuery({
    queryKey: queryKeys.auditLogs(filters),
    queryFn: async () => {
      const queryParams = buildQueryParams(filters);
      const data = await apiClient.get(`/dashboard/audit-logs?${queryParams}`);
      return data;
    },
    ...queryOptions,
  });
};

/**
 * Hook for audit logs management (combines data fetching with common operations)
 */
export const useAuditLogsManagement = (initialFilters = {}) => {
  const [filters, setFilters] = useState(initialFilters);

  const {
    data: auditLogsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useAuditLogs(filters);

  // Extract data from API response
  const auditLogs = auditLogsData?.auditLogs || [];
  const pagination = auditLogsData?.pagination || {};
  const appliedFilters = auditLogsData?.filters || {};
  const currentUser = auditLogsData?.currentUser || null;

  // Update filters with new values
  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({});
  };

  // Refresh audit logs data
  const refresh = () => {
    refetch();
  };

  return {
    // Data
    auditLogs,
    pagination,
    appliedFilters,
    currentUser,

    // State
    isLoading,
    isError,
    error,

    // Actions
    updateFilters,
    clearFilters,
    refresh,
    refetch,
  };
};
