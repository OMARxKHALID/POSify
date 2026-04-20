import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import {
  getDefaultQueryOptions,
  getDefaultMutationOptions,
  handleHookSuccess,
  queryKeys,
  invalidateQueries,
  createDemoQueryFn,
} from "@/lib/helpers/hook.helpers";
import { useIsDemoModeEnabled } from "@/features/settings/hooks/use-demo-mode";
import { mockFallback } from "@/lib/mockup-data";

export const useCategories = (options = {}) => {
  const isDemoMode = useIsDemoModeEnabled();

  return useQuery({
    queryKey: queryKeys.categories(),
    queryFn: createDemoQueryFn(
      "/dashboard/categories",
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
    mutationFn: async (categoryData) => {
      const response = await apiClient.post(
        "/dashboard/categories/create",
        categoryData,
      );
      return response;
    },
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
    mutationFn: async ({ categoryId, categoryData }) => {
      const response = await apiClient.put(
        `/dashboard/categories/edit?categoryId=${categoryId}`,
        categoryData,
      );
      return response;
    },
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
    mutationFn: async (categoryId) => {
      const response = await apiClient.delete(
        `/dashboard/categories/delete?categoryId=${categoryId}`,
      );
      return response;
    },
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
