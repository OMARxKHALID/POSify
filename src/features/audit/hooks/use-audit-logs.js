import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/lib/mock-auth";
import {
  getDefaultQueryOptions,
  queryKeys,
  createDemoQueryFn,
} from "@/lib/helpers/hook.helpers";
import { useIsDemoModeEnabled } from "@/features/settings/hooks/use-demo-mode";
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
  const { data: session } = useSession();
  const isDemoMode = useIsDemoModeEnabled();

  const queryParams = buildQueryParams(filters);

  return useQuery({
    queryKey: [...queryKeys.auditLogs(filters), session?.user?.id],
    queryFn: createDemoQueryFn(
      `/dashboard/audit-logs?${queryParams}`,
      () => mockFallback.auditLogs().data,
      isDemoMode,
    ),
    ...getDefaultQueryOptions({
      staleTime: 2 * 60 * 1000,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      ...options,
    }),
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
