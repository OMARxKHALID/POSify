/**
 * useMenu Hook
 * Custom hook for menu management operations using TanStack React Query
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { apiClient } from "@/lib/api-client";
import { mockMenuItems } from "@/lib/mockup-data";
import {
  getDefaultQueryOptions,
  getDefaultMutationOptions,
  handleHookSuccess,
  queryKeys,
  invalidateQueries,
} from "@/lib/hooks/hook-utils";

/**
 * Hook to fetch menu items based on authenticated user's role and permissions
 */
export const useMenu = (options = {}) => {
  const { data: session } = useSession();

  const queryOptions = getDefaultQueryOptions({
    staleTime: 3 * 60 * 1000, // 3 minutes (menu data changes moderately)
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
    ...options,
  });

  return useQuery({
    queryKey: [...queryKeys.menu, session?.user?.id], // Include session user ID in query key to force refresh on session change
    queryFn: async () => {
      try {
        const data = await apiClient.get("/dashboard/menu");
        return data;
      } catch (error) {
        // Fallback to mock data if API is not available
        console.warn("Menu API not available, using mock data:", error.message);
        return {
          menuItems: mockMenuItems,
          success: true,
          message: "Using mock data",
        };
      }
    },
    ...queryOptions,
  });
};

/**
 * Menu Item Creation Hook
 * Creates a new menu item (admin only)
 */
export const useCreateMenuItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (menuItemData) => {
      const response = await apiClient.post(
        "/dashboard/menu/create",
        menuItemData
      );
      return response;
    },
    onSuccess: () => {
      invalidateQueries.menu(queryClient);
      handleHookSuccess("MENU_ITEM_CREATED_SUCCESSFULLY");
    },
    ...getDefaultMutationOptions({ operation: "Menu item creation" }),
  });
};

/**
 * Menu Item Edit Hook
 * Edits/updates an existing menu item
 */
export const useEditMenuItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ menuItemId, menuItemData }) => {
      const response = await apiClient.put(
        `/dashboard/menu/edit?menuItemId=${menuItemId}`,
        menuItemData
      );
      return response;
    },
    onSuccess: () => {
      invalidateQueries.menu(queryClient);
      handleHookSuccess("MENU_ITEM_UPDATED_SUCCESSFULLY");
    },
    ...getDefaultMutationOptions({ operation: "Menu item update" }),
  });
};

/**
 * Menu Item Delete Hook
 * Deletes a menu item
 */
export const useDeleteMenuItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (menuItemId) => {
      const response = await apiClient.delete(
        `/dashboard/menu/delete?menuItemId=${menuItemId}`
      );
      return response;
    },
    onSuccess: () => {
      invalidateQueries.menu(queryClient);
      handleHookSuccess("MENU_ITEM_DELETED_SUCCESSFULLY");
    },
    ...getDefaultMutationOptions({ operation: "Menu item deletion" }),
  });
};

/**
 * Main Menu Management Hook
 * Provides a unified interface for all menu management operations
 */
export const useMenuManagement = () => {
  const menuQuery = useMenu();
  const createMenuItemMutation = useCreateMenuItem();
  const editMenuItemMutation = useEditMenuItem();
  const deleteMenuItemMutation = useDeleteMenuItem();

  return {
    ...menuQuery,
    createMenuItem: createMenuItemMutation,
    editMenuItem: editMenuItemMutation,
    deleteMenuItem: deleteMenuItemMutation,
  };
};
