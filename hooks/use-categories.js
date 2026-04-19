import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import {
  getDefaultQueryOptions,
  getDefaultMutationOptions,
  handleHookSuccess,
  queryKeys,
  invalidateQueries,
  isDemoModeEnabled,
} from "@/lib/hooks/hook-utils";
import { mockFallback, isDataEmpty } from "@/lib/mockup-data";

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
      try {
        const data = await apiClient.get("/dashboard/categories");
        if (isDemoModeEnabled() && isDataEmpty(data)) {
          return mockFallback.categories().data;
        }
        return data;
      } catch (error) {
        if (isDemoModeEnabled()) {
          console.warn(
            "Categories API failed, using demo data:",
            error.message,
          );
          return mockFallback.categories().data;
        }
        throw error;
      }
    },
    ...queryOptions,
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

/**
 * Category Delete Hook
 * Deletes a category
 */
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
