import { Menu } from "@/models/menu";
import { Order } from "@/models/order";
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
 * Handle menu item deletion with role-based permissions and organization scoping
 */
const handleMenuItemDelete = async (queryParams, request) => {
  const { menuItemId } = queryParams;
  const currentUser = await getAuthenticatedUser();

  // Only admin can delete menu items
  if (!hasRole(currentUser, ["admin"])) {
    return forbidden("INSUFFICIENT_PERMISSIONS");
  }

  // Validate menu item ID parameter
  if (!menuItemId || typeof menuItemId !== "string") {
    return badRequest("INVALID_MENU_ITEM_ID");
  }

  // Find target menu item to delete
  const targetMenuItem = await Menu.findById(menuItemId);
  if (!targetMenuItem) {
    return notFound("MENU_ITEM_NOT_FOUND");
  }

  // Admin can only delete menu items from their organization
  if (
    !currentUser.organizationId ||
    !targetMenuItem.organizationId ||
    currentUser.organizationId.toString() !==
      targetMenuItem.organizationId.toString()
  ) {
    return forbidden("INSUFFICIENT_PERMISSIONS");
  }

  // Validate organization exists
  const organization = await validateOrganizationExists(currentUser);
  if (!organization || organization.error) return organization;

  // Check for critical dependencies before deletion
  // Check if menu item is referenced in any orders
  const orderCount = await Order.countDocuments({
    "items.menuItemId": menuItemId,
  });

  if (orderCount > 0) {
    return badRequest("MENU_ITEM_HAS_ORDERS");
  }

  // Store menu item data for audit trail
  const menuItemToDelete = { ...targetMenuItem.toObject() };

  try {
    // Delete menu item from database
    const deletedMenuItem = await Menu.findByIdAndDelete(menuItemId);
    if (!deletedMenuItem) {
      return serverError("DELETE_FAILED");
    }

    // Log the deletion
    await logDelete("Menu", menuItemToDelete, currentUser, request);

    const menuResponse = formatMenuData(deletedMenuItem);

    return apiSuccess("MENU_ITEM_DELETED_SUCCESSFULLY", menuResponse);
  } catch (error) {
    return serverError("DELETE_FAILED");
  }
};

/**
 * DELETE /api/dashboard/menu/delete?menuItemId=<id>
 * Delete a menu item based on role-based permissions
 */
export const DELETE = createDeleteHandler(handleMenuItemDelete);

// Fallback for unsupported HTTP methods
export const { GET, POST, PUT } = createMethodHandler(["DELETE"]);
