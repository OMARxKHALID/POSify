import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppContext } from "@/lib/hooks/use-app-context";
import {
  getDefaultQueryOptions,
  getDefaultMutationOptions,
  handleHookSuccess,
  queryKeys,
  invalidateQueries,
  createServiceQueryFn,
} from "@/lib/helpers/hook.helpers";
import { mockFallback } from "@/lib/mockup-data";
import { menuService } from "../services/menu.service";

export const useCategories = (options = {}) => {
  const { userId, isDemoMode } = useAppContext();

  return useQuery({
    queryKey: queryKeys.categories(userId),
    queryFn: createServiceQueryFn(
      menuService.getCategories,
      () => mockFallback.categories(),
      isDemoMode,
    ),
    ...getDefaultQueryOptions(options),
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
