import { Menu } from "@/models/menu";
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
    displayOrder: menuItem.displayOrder,
    tags: menuItem.tags,
    category: menuItem.category,
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

    // Only admin and super_admin can access menu management
    if (!hasRole(currentUser, ["admin", "super_admin"])) {
      return forbidden("INSUFFICIENT_PERMISSIONS");
    }

    let menuItems = [];
    let categories = [];
    let organizationData = null;

    switch (currentUser.role) {
    case "super_admin":
      // Super admin can see all menu items across organizations
      menuItems = await Menu.find({})
        .populate("category", "name icon")
        .populate("organizationId", "name")
        .sort({ organizationId: 1, displayOrder: 1, createdAt: -1 });

      categories = await Category.find({})
        .populate("organizationId", "name")
        .sort({ organizationId: 1, displayOrder: 1 });
      break;

    case "admin":
      // Validate organization exists
      const organization = await validateOrganizationExists(currentUser);
      if (!organization || organization.error) return organization;

      organizationData = { id: organization._id, name: organization.name };

      // Admin can only see menu items from their organization
      menuItems = await Menu.find({
        organizationId: currentUser.organizationId,
      })
        .populate("category", "name icon")
        .sort({ displayOrder: 1, createdAt: -1 });

      categories = await Category.find({
        organizationId: currentUser.organizationId,
      }).sort({ displayOrder: 1 });
      break;

    default:
      return forbidden("INSUFFICIENT_PERMISSIONS");
    }

    const formattedMenuItems = menuItems.map(formatMenuData);
    const formattedCategories = categories.map((category) => ({
      id: category._id,
      name: category.name,
      icon: category.icon,
      image: category.image,
      description: category.description,
      displayOrder: category.displayOrder,
      isActive: category.isActive,
      organizationId: category.organizationId,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }));

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
    return serverError("FETCH_FAILED");
  }
};

/**
 * GET /api/dashboard/menu
 * Get menu items based on authenticated user's role and permissions
 */
export const GET = createGetHandler(handleMenuData);

// Fallback for unsupported HTTP methods
export const { POST, PUT, DELETE } = createMethodHandler(["GET"]);
