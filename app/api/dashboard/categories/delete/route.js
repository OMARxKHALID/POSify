import { Category } from "@/models/category";
import { Menu } from "@/models/menu";
import { logDelete } from "@/lib/helpers/audit-helpers";
import {
  getAuthenticatedUser,
  hasRole,
  createMethodHandler,
  createDeleteHandler,
  apiSuccess,
  notFound,
  forbidden,
  serverError,
  badRequest,
  validateOrganizationExists,
} from "@/lib/api";

/**
 * Format category data for API response
 */
const formatCategoryData = (category) => ({
  id: category._id,
  organizationId: category.organizationId,
  name: category.name,
  icon: category.icon,
  image: category.image,
  description: category.description,
  isActive: category.isActive,
  createdAt: category.createdAt,
  updatedAt: category.updatedAt,
  createdBy: category.createdBy,
  lastModifiedBy: category.lastModifiedBy,
});

/**
 * Handle category deletion with role-based permissions and organization scoping
 */
const handleCategoryDelete = async (queryParams, request) => {
  const { categoryId } = queryParams;
  const currentUser = await getAuthenticatedUser();

  // Only admin can delete categories
  if (!hasRole(currentUser, ["admin"])) {
    return forbidden("INSUFFICIENT_PERMISSIONS");
  }

  // Validate category ID parameter
  if (!categoryId || typeof categoryId !== "string") {
    return badRequest("INVALID_CATEGORY_ID");
  }

  // Find target category to delete
  const targetCategory = await Category.findById(categoryId);
  if (!targetCategory) {
    return notFound("CATEGORY_NOT_FOUND");
  }

  // Admin can only delete categories from their organization
  if (
    !currentUser.organizationId ||
    !targetCategory.organizationId ||
    currentUser.organizationId.toString() !==
      targetCategory.organizationId.toString()
  ) {
    return forbidden("INSUFFICIENT_PERMISSIONS");
  }

  // Validate organization exists
  const organization = await validateOrganizationExists(currentUser);
  if (!organization || organization.error) return organization;

  // Check for critical dependencies before deletion
  // Check if category is referenced in any menu items
  const menuItemCount = await Menu.countDocuments({
    categoryId: categoryId,
  });

  if (menuItemCount > 0) {
    return badRequest("CATEGORY_HAS_DEPENDENT_MENU_ITEMS");
  }

  // Store category data for audit trail
  const categoryToDelete = { ...targetCategory.toObject() };

  try {
    // Delete category from database
    const deletedCategory = await Category.findByIdAndDelete(categoryId);
    if (!deletedCategory) {
      return serverError("DELETE_FAILED");
    }

    // Log the deletion
    await logDelete("Category", categoryToDelete, currentUser, request);

    const categoryResponse = formatCategoryData(deletedCategory);

    return apiSuccess("CATEGORY_DELETED_SUCCESSFULLY", categoryResponse);
  } catch (error) {
    return serverError("DELETE_FAILED");
  }
};

/**
 * DELETE /api/dashboard/categories/delete?categoryId=<id>
 * Delete a category based on role-based permissions
 */
export const DELETE = createDeleteHandler(handleCategoryDelete);

// Fallback for unsupported HTTP methods
export const { GET, POST, PUT } = createMethodHandler(["DELETE"]);
