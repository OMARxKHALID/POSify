import { apiClient } from "@/lib/api-client";
import { menuSchema } from "../schemas/menu.schema";
import { categorySchema } from "../schemas/category.schema";
import { z } from "zod";

export const menuService = {
  getMenu: async () => {
    const response = await apiClient.get("/dashboard/menu");
    const menuItems = response.data?.menuItems || [];
    const validatedItems = z.array(menuSchema).parse(menuItems);
    return {
      ...response.data,
      menuItems: validatedItems
    };
  },

  createMenuItem: async (menuItemData) => {
    const response = await apiClient.post("/dashboard/menu/create", menuItemData);
    return menuSchema.parse(response.data);
  },

  updateMenuItem: async (menuItemId, menuItemData) => {
    const response = await apiClient.put(`/dashboard/menu/edit?menuItemId=${menuItemId}`, menuItemData);
    return menuSchema.parse(response.data);
  },

  deleteMenuItem: async (menuItemId) => {
    const response = await apiClient.delete(`/dashboard/menu/delete?menuItemId=${menuItemId}`);
    return response;
  },

  getCategories: async () => {
    const response = await apiClient.get("/dashboard/categories");
    const categories = response.data?.categories || [];
    const validatedCategories = z.array(categorySchema).parse(categories);
    return {
      ...response.data,
      categories: validatedCategories
    };
  },

  createCategory: async (categoryData) => {
    const response = await apiClient.post("/dashboard/categories/create", categoryData);
    return categorySchema.parse(response.data);
  },

  updateCategory: async (categoryId, categoryData) => {
    const response = await apiClient.put(`/dashboard/categories/edit?categoryId=${categoryId}`, categoryData);
    return categorySchema.parse(response.data);
  },

  deleteCategory: async (categoryId) => {
    const response = await apiClient.delete(`/dashboard/categories/delete?categoryId=${categoryId}`);
    return response;
  }
};
