/**
 * useCategories Hook
 * Custom hook for category management operations using TanStack React Query
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
 * Hook to fetch categories
 */
export const useCategories = (options = {}) => {
  const queryOptions = getDefaultQueryOptions({
    staleTime: 3 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    ...options,
  });

  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: async () => {
      const data = await apiClient.get("/dashboard/categories");
      return data;
    },
    ...queryOptions,
  });
};

/**
 * Category Creation Hook
 * Creates a new category
 */
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryData) => {
      const response = await apiClient.post(
        "/dashboard/categories/create",
        categoryData
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

/**
 * Category Edit Hook
 * Edits/updates an existing category
 */
export const useEditCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ categoryId, categoryData }) => {
      const response = await apiClient.put(
        `/dashboard/categories/edit?categoryId=${categoryId}`,
        categoryData
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

/**
 * Category Delete Hook
 * Deletes a category
 */
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId) => {
      const response = await apiClient.delete(
        `/dashboard/categories/delete?categoryId=${categoryId}`
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

/**
 * Main Categories Management Hook
 * Provides a unified interface for all category management operations
 */
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
