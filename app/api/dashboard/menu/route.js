import { Menu } from "@/models/menu";
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
 * Format menu item data for API response
 */
const formatMenuData = (menuItem) => {
  return {
    id: menuItem._id,
    name: menuItem.name,
    description: menuItem.description,
    price: menuItem.price,
    image: menuItem.image,
    icon: menuItem.icon,
    available: menuItem.available,
    prepTime: menuItem.prepTime,
    isSpecial: menuItem.isSpecial,
    categoryId: menuItem.categoryId,
    organizationId: menuItem.organizationId,
    createdAt: menuItem.createdAt,
    updatedAt: menuItem.updatedAt,
  };
};

/**
 * Handle menu data request with role-based access control
 */
const handleMenuData = async (queryParams, request) => {
  try {
    const currentUser = await getAuthenticatedUser();

    // Only admin can access menu management
    if (!hasRole(currentUser, ["admin"])) {
      return forbidden("INSUFFICIENT_PERMISSIONS");
    }

    // Validate organization exists
    const organization = await validateOrganizationExists(currentUser);
    if (!organization || organization.error) return organization;

    const organizationData = { id: organization._id, name: organization.name };

    // Admin can only see menu items from their organization
    const menuItems = await Menu.find({
      organizationId: currentUser.organizationId,
    }).sort({ createdAt: -1 });

    const formattedMenuItems = menuItems.map(formatMenuData);

    return apiSuccess("MENU_RETRIEVED_SUCCESSFULLY", {
      menuItems: formattedMenuItems,
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
