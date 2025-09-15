import { Menu } from "@/models/menu";
import { Category } from "@/models/category";
import { formatCategoryForAPI } from "@/lib/utils/category-utils";
import { formatMenuItemForAPI } from "@/lib/utils/menu-utils";
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

// Using utility function for consistent formatting
const formatMenuData = formatMenuItemForAPI;

/**
 * Handle menu data request with role-based access control
 */
const handleMenuData = async (queryParams, request) => {
  try {
    const currentUser = await getAuthenticatedUser();

    // Admin and staff can access menu data
    if (!hasRole(currentUser, ["admin", "staff"])) {
      return forbidden("INSUFFICIENT_PERMISSIONS");
    }

    // Validate organization exists
    const organization = await validateOrganizationExists(currentUser);
    if (!organization || organization.error) return organization;

    const organizationData = { id: organization._id, name: organization.name };

    // Fetch categories for the organization
    const categories = await Category.find({
      organizationId: currentUser.organizationId,
      isActive: true,
    }).sort({ name: 1 });

    // Admin can only see menu items from their organization
    const menuItems = await Menu.find({
      organizationId: currentUser.organizationId,
    })
      .populate("categoryId", "name icon")
      .sort({ createdAt: -1 });

    const formattedMenuItems = menuItems.map(formatMenuData);
    const formattedCategories = categories.map(formatCategoryForAPI);

    return apiSuccess("MENU_RETRIEVED_SUCCESSFULLY", {
      menuItems: formattedMenuItems,
      categories: formattedCategories,
      organization: organizationData,
      currentUser: {
        id: currentUser._id,
        role: currentUser.role,
        organizationId: currentUser.organizationId,
      },
    });
  } catch (error) {
    return serverError("MENU_RETRIEVAL_FAILED");
  }
};

/**
 * GET /api/dashboard/menu
 * Get menu items based on authenticated user's role and permissions
 */
export const GET = createGetHandler(handleMenuData);

// Fallback for unsupported HTTP methods
export const { POST, PUT, DELETE } = createMethodHandler(["GET"]);
