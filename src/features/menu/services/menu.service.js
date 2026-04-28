import { apiClient } from "@/lib/api-client";
import { menuSchema } from "../schemas/menu.schema";
import { categorySchema } from "../schemas/category.schema";
import { z } from "zod";
import { handleServiceError } from "@/lib/utils/error-handler";

export const menuService = {
  getMenu: async () => {
    try {
      const response = await apiClient.get("/dashboard/menu");
      const menuItems = response.data?.menuItems || [];
      const validatedItems = z.array(menuSchema).parse(menuItems);
      return {
        menuItems: validatedItems,
        ...(response.data?.categories && { categories: z.array(categorySchema).safeParse(response.data.categories).data || [] })
      };
    } catch (error) {
      handleServiceError(error);
    }
  },

  createMenuItem: async (menuItemData) => {
    try {
      const response = await apiClient.post("/dashboard/menu/create", menuItemData);
      return menuSchema.parse(response.data);
    } catch (error) {
      handleServiceError(error);
    }
  },

  updateMenuItem: async (menuItemId, menuItemData) => {
    try {
      const response = await apiClient.put(`/dashboard/menu/edit?menuItemId=${menuItemId}`, menuItemData);
      return menuSchema.parse(response.data);
    } catch (error) {
      handleServiceError(error);
    }
  },

  deleteMenuItem: async (menuItemId) => {
    try {
      const response = await apiClient.delete(`/dashboard/menu/delete?menuItemId=${menuItemId}`);
      return menuSchema.parse(response.data);
    } catch (error) {
      handleServiceError(error);
    }
  },

  getCategories: async () => {
    try {
      const response = await apiClient.get("/dashboard/categories");
      const categories = response.data?.categories || [];
      const validatedCategories = z.array(categorySchema).parse(categories);
      return {
        categories: validatedCategories
      };
    } catch (error) {
      handleServiceError(error);
    }
  },

  createCategory: async (categoryData) => {
    try {
      const response = await apiClient.post("/dashboard/categories/create", categoryData);
      return categorySchema.parse(response.data);
    } catch (error) {
      handleServiceError(error);
    }
  },

  updateCategory: async (categoryId, categoryData) => {
    try {
      const response = await apiClient.put(`/dashboard/categories/edit?categoryId=${categoryId}`, categoryData);
      return categorySchema.parse(response.data);
    } catch (error) {
      handleServiceError(error);
    }
  },

  deleteCategory: async (categoryId) => {
    try {
      const response = await apiClient.delete(`/dashboard/categories/delete?categoryId=${categoryId}`);
      return categorySchema.parse(response.data);
    } catch (error) {
      handleServiceError(error);
    }
  }
};
