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
 * Handle menu item deletion with role-based permissions and organization scoping
 */
const handleMenuItemDelete = async (queryParams, request) => {
  const { menuItemId } = queryParams;
  const currentUser = await getAuthenticatedUser();

  // Only admin and super_admin can delete menu items
  if (!hasRole(currentUser, ["admin", "super_admin"])) {
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

  // Role-based organization checks
  if (currentUser.role === "admin") {
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
  }

  // Check for critical dependencies before deletion
  // Check if menu item is referenced in any orders
  const orderCount = await Order.countDocuments({
    "items.menuItemId": menuItemId,
  });

  if (orderCount > 0) {
    return badRequest("MENU_ITEM_HAS_ORDERS", {
      message: "Cannot delete menu item that has been ordered",
      orderCount,
    });
  }

  // Store menu item data for audit trail
  const menuItemToDelete = { ...targetMenuItem.toObject() };

  // Delete menu item from database
  let deletedMenuItem;
  try {
    deletedMenuItem = await Menu.findByIdAndDelete(menuItemId);
    if (!deletedMenuItem) {
      return serverError("DELETE_FAILED");
    }
  } catch (error) {
    return serverError("DELETE_FAILED");
  }

  // Log menu item deletion for audit trail
  try {
    await logDelete("Menu", menuItemToDelete, currentUser, request);
  } catch (auditError) {
    // Don't fail the deletion if audit logging fails
  }

  // Prepare response data
  const menuResponse = {
    id: deletedMenuItem._id,
    name: deletedMenuItem.name,
    description: deletedMenuItem.description,
    price: deletedMenuItem.price,
    image: deletedMenuItem.image,
    icon: deletedMenuItem.icon,
    available: deletedMenuItem.available,
    prepTime: deletedMenuItem.prepTime,
    isSpecial: deletedMenuItem.isSpecial,
    displayOrder: deletedMenuItem.displayOrder,
    tags: deletedMenuItem.tags,
    category: deletedMenuItem.category,
    organizationId: deletedMenuItem.organizationId,
    createdAt: deletedMenuItem.createdAt,
    updatedAt: deletedMenuItem.updatedAt,
  };

  return apiSuccess("MENU_ITEM_DELETED_SUCCESSFULLY", menuResponse);
};

/**
 * DELETE /api/dashboard/menu/delete?menuItemId=<id>
 * Delete a menu item based on role-based permissions
 */
export const DELETE = createDeleteHandler(handleMenuItemDelete);

// Fallback for unsupported HTTP methods
export const { GET, POST, PUT } = createMethodHandler(["DELETE"]);
