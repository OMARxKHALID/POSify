import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

/**
 * Hook to fetch organization overview data
 */
export const useOrganizationOverview = () => {
  return useQuery({
    queryKey: ["organization", "overview"],
    queryFn: () => apiClient.get("/organizations/overview"),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};
