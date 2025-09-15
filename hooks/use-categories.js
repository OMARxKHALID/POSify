/**
 * useCategories Hook
 * Custom hook for category management operations using TanStack React Query
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { apiClient } from "@/lib/api-client";
import { mockCategories } from "@/lib/mockup-data";
import {
  getDefaultQueryOptions,
  getDefaultMutationOptions,
  handleHookSuccess,
  queryKeys,
  invalidateQueries,
} from "@/lib/hooks/hook-utils";

/**
 * Hook to fetch categories based on authenticated user's role and permissions
 */
export const useCategories = (options = {}) => {
  const { data: session } = useSession();

  const queryOptions = getDefaultQueryOptions({
    staleTime: 3 * 60 * 1000, // 3 minutes (categories data changes moderately)
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
    ...options,
  });

  return useQuery({
    queryKey: [...queryKeys.categories, session?.user?.id], // Include session user ID in query key to force refresh on session change
    queryFn: async () => {
      try {
        const data = await apiClient.get("/dashboard/categories");
        return data;
      } catch (error) {
        // Fallback to mock data if API is not available
        console.warn(
          "Categories API not available, using mock data:",
          error.message
        );
        return {
          categories: mockCategories,
          success: true,
          message: "Using mock data",
        };
      }
    },
    ...queryOptions,
  });
};

/**
 * Category Creation Hook
 * Creates a new category (admin only)
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
