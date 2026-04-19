

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import {
  getDefaultQueryOptions,
  getDefaultMutationOptions,
  handleHookSuccess,
  queryKeys,
  invalidateQueries,
  createDemoQueryFn,
} from "@/lib/helpers/hook-helpers";
import { useIsDemoModeEnabled } from "@/hooks/use-demo-mode";
import { mockFallback } from "@/lib/mockup-data";

export const useMenu = (options = {}) => {
  const isDemoMode = useIsDemoModeEnabled();

  return useQuery({
    queryKey: queryKeys.menu,
    queryFn: createDemoQueryFn(
      "/dashboard/menu",
      () => mockFallback.menu().data,
      isDemoMode,
    ),
    ...getDefaultQueryOptions({
      staleTime: 3 * 60 * 1000,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      ...options,
    }),
  });
};


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
