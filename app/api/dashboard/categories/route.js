import { Category } from "@/models/category";
import {
  getAuthenticatedUser,
  hasRole,
  createMethodHandler,
  createGetHandler,
  apiSuccess,
  forbidden,
  serverError,
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
 * Handle categories data request with role-based access control
 */
const handleCategoriesData = async (queryParams, request) => {
  try {
    const currentUser = await getAuthenticatedUser();

    // Admin and staff can access categories
    if (!hasRole(currentUser, ["admin", "staff"])) {
      return forbidden("INSUFFICIENT_PERMISSIONS");
    }

    // Validate organization exists
    const organization = await validateOrganizationExists(currentUser);
    if (!organization || organization.error) return organization;

    const organizationData = { id: organization._id, name: organization.name };

    // Admin can only see categories from their organization
    const categories = await Category.find({
      organizationId: currentUser.organizationId,
    }).sort({ createdAt: -1 });

    const formattedCategories = categories.map(formatCategoryData);

    return apiSuccess("CATEGORIES_RETRIEVED_SUCCESSFULLY", {
      categories: formattedCategories,
      organization: organizationData,
      currentUser: {
        id: currentUser._id,
        role: currentUser.role,
        organizationId: currentUser.organizationId,
      },
    });
  } catch (error) {
    return serverError("CATEGORIES_RETRIEVAL_FAILED");
  }
};

/**
 * GET /api/dashboard/categories
 * Get categories based on authenticated user's role and permissions
 */
export const GET = createGetHandler(handleCategoriesData);

// Fallback for unsupported HTTP methods
export const { POST, PUT, DELETE } = createMethodHandler(["GET"]);
