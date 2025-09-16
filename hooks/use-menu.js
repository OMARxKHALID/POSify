/**
 * useMenu Hook
 * Custom hook for menu management operations using TanStack React Query
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import {
  getDefaultQueryOptions,
  getDefaultMutationOptions,
  handleHookSuccess,
  queryKeys,
  invalidateQueries,
} from "@/lib/hooks/hook-utils";

/**
 * Hook to fetch menu items
 */
export const useMenu = (options = {}) => {
  const queryOptions = getDefaultQueryOptions({
    staleTime: 3 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    ...options,
  });

  return useQuery({
    queryKey: queryKeys.menu,
    queryFn: async () => {
      const data = await apiClient.get("/dashboard/menu");
      return data;
    },
    ...queryOptions,
  });
};

/**
 * Menu Item Creation Hook
 * Creates a new menu item
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
