import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

/**
 * Custom hook to fetch organization data
 * Uses React Query for caching and state management
 */
export function useOrganization() {
  return useQuery({
    queryKey: ["organization"],
    queryFn: async () => {
      const data = await apiClient.get("/organizations");
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

/**
 * Custom hook to get organization statistics
 * Returns formatted stats for dashboard display
 */
export function useOrganizationStats(organization) {
  if (!organization) {
    return {
      subscription: {
        plan: "N/A",
        status: "N/A",
        isActive: false,
      },
      usage: {
        users: { current: 0, limit: 0, percentage: 0 },
        menuItems: { current: 0, limit: 0, percentage: 0 },
        orders: { current: 0, limit: 0, percentage: 0 },
        locations: { current: 0, limit: 0, percentage: 0 },
      },
      business: {
        type: "N/A",
        status: "N/A",
        onboardingCompleted: false,
      },
    };
  }

  const { subscription, usage, limits, businessType, status, onboardingCompleted } = organization;

  return {
    subscription: {
      plan: subscription?.plan || "free",
      status: subscription?.status || "inactive",
      isActive: ["active", "trialing"].includes(subscription?.status),
    },
    usage: {
      users: {
        current: usage?.currentUsers || 0,
        limit: limits?.users || 0,
        percentage: limits?.users ? Math.round((usage?.currentUsers / limits.users) * 100) : 0,
      },
      menuItems: {
        current: usage?.currentMenuItems || 0,
        limit: limits?.menuItems || 0,
        percentage: limits?.menuItems ? Math.round((usage?.currentMenuItems / limits.menuItems) * 100) : 0,
      },
      orders: {
        current: usage?.ordersThisMonth || 0,
        limit: limits?.ordersPerMonth || 0,
        percentage: limits?.ordersPerMonth ? Math.round((usage?.ordersThisMonth / limits.ordersPerMonth) * 100) : 0,
      },
      locations: {
        current: 1, // Default to 1 location
        limit: limits?.locations || 1,
        percentage: limits?.locations ? Math.round((1 / limits.locations) * 100) : 100,
      },
    },
    business: {
      type: businessType || "restaurant",
      status: status || "active",
      onboardingCompleted: onboardingCompleted || false,
    },
  };
}
