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

export const useCategories = (options = {}) => {
  const isDemoMode = useIsDemoModeEnabled();

  return useQuery({
    queryKey: queryKeys.categories(),
    queryFn: createServiceQueryFn(
      menuService.getCategories,
      () => mockFallback.categories().data,
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

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryData) => menuService.createCategory(categoryData),
    onSuccess: () => {
      invalidateQueries.categories(queryClient);
      handleHookSuccess("CATEGORY_CREATED_SUCCESSFULLY");
    },
    ...getDefaultMutationOptions({ operation: "Category creation" }),
  });
};

export const useEditCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoryId, categoryData }) => menuService.updateCategory(categoryId, categoryData),
    onSuccess: () => {
      invalidateQueries.categories(queryClient);
      handleHookSuccess("CATEGORY_UPDATED_SUCCESSFULLY");
    },
    ...getDefaultMutationOptions({ operation: "Category update" }),
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId) => menuService.deleteCategory(categoryId),
    onSuccess: () => {
      invalidateQueries.categories(queryClient);
      handleHookSuccess("CATEGORY_DELETED_SUCCESSFULLY");
    },
    ...getDefaultMutationOptions({ operation: "Category deletion" }),
  });
};

export const useCategoriesManagement = () => {
  const categoriesQuery = useCategories();
  const createCategoryMutation = useCreateCategory();
  const editCategoryMutation = useEditCategory();
  const deleteCategoryMutation = useDeleteCategory();

  return {
    ...categoriesQuery,
    createCategory: createCategoryMutation,
    editCategory: editCategoryMutation,
    deleteCategory: deleteCategoryMutation,
  };
};
