import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDefaultQueryOptions,
  getDefaultMutationOptions,
  handleHookSuccess,
  queryKeys,
  invalidateQueries,
  createServiceQueryFn,
} from "@/lib/helpers/hook.helpers";
import { useIsDemoModeEnabled } from "@/features/settings/hooks/use-demo-mode";
import { mockFallback } from "@/lib/mockup-data";
import { menuService } from "../services/menu.service";

export const useMenu = (options = {}) => {
  const isDemoMode = useIsDemoModeEnabled();

  return useQuery({
    queryKey: queryKeys.menu(),
    queryFn: createServiceQueryFn(
      menuService.getMenu,
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
    mutationFn: (menuItemData) => menuService.createMenuItem(menuItemData),
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
    mutationFn: ({ menuItemId, menuItemData }) => menuService.updateMenuItem(menuItemId, menuItemData),
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
    mutationFn: (menuItemId) => menuService.deleteMenuItem(menuItemId),
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
