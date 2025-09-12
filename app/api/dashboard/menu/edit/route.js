import mongoose from "mongoose";
import { Menu } from "@/models/menu";
import { Category } from "@/models/category";
import { menuFormSchema } from "@/schemas/menu-schema";
import { formatCategoryForAPI } from "@/lib/utils/category-utils";
import { formatMenuItemForAPI } from "@/lib/utils/menu-utils";
import { logUpdate } from "@/lib/helpers/audit-helpers";
import {
  getAuthenticatedUser,
  hasRole,
  createMethodHandler,
  createPutHandler,
  apiSuccess,
  notFound,
  forbidden,
  badRequest,
  serverError,
  validateOrganizationExists,
} from "@/lib/api";

// Using utility function for consistent formatting
const formatMenuData = formatMenuItemForAPI;

/**
 * Handle menu item editing with role-based permissions and validation
 */
const handleMenuItemEdit = async (validatedData, queryParams, request) => {
  const { menuItemId } = queryParams;
  const updateData = validatedData;
  const currentUser = await getAuthenticatedUser();

  // Only admin can edit menu items
  if (!hasRole(currentUser, ["admin"])) {
    return forbidden("INSUFFICIENT_PERMISSIONS");
  }

  // Validate menu item ID parameter
  if (!menuItemId || typeof menuItemId !== "string") {
    return badRequest("INVALID_MENU_ITEM_ID");
  }

  // Find target menu item
  const targetMenuItem = await Menu.findById(menuItemId);
  if (!targetMenuItem) {
    return notFound("MENU_ITEM_NOT_FOUND");
  }

  // Admin can only edit menu items from their organization
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

  // Fetch categories for the organization
  const categories = await Category.find({
    organizationId: currentUser.organizationId,
    isActive: true,
  }).sort({ name: 1 });

  // Check for duplicate menu item name within the same organization
  if (updateData.name && updateData.name !== targetMenuItem.name) {
    const existingMenuItem = await Menu.findOne({
      organizationId: targetMenuItem.organizationId,
      name: updateData.name.trim(),
      _id: { $ne: menuItemId },
    });

    if (existingMenuItem) {
      return badRequest("MENU_ITEM_NAME_EXISTS");
    }
  }

  // Clean and prepare update data
  if (updateData.name) {
    updateData.name = updateData.name.trim();
  }
  if (updateData.description) {
    updateData.description = updateData.description.trim();
  }
  if (updateData.image) {
    updateData.image = updateData.image.trim();
  }
  if (updateData.icon) {
    updateData.icon = updateData.icon.trim();
  }

  const oldMenuItem = targetMenuItem.toObject
    ? targetMenuItem.toObject()
    : targetMenuItem;
  updateData.lastModifiedBy = currentUser._id;

  // Update menu item with transaction
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const updatedMenuItem = await Menu.findByIdAndUpdate(
        menuItemId,
        updateData,
        {
          new: true,
          runValidators: true,
          session,
        }
      );

      if (!updatedMenuItem) {
        throw new Error("UPDATE_FAILED");
      }

      await logUpdate(
        "Menu",
        oldMenuItem,
        updatedMenuItem,
        currentUser,
        request
      );
    });

    // Fetch updated menu item after transaction
    const updatedMenuItem = await Menu.findById(menuItemId);

    const menuResponse = formatMenuData(updatedMenuItem);
    const formattedCategories = categories.map(formatCategoryForAPI);

    return apiSuccess("MENU_ITEM_UPDATED_SUCCESSFULLY", {
      menuItem: menuResponse,
      categories: formattedCategories,
    });
  } catch (error) {
    return serverError("UPDATE_FAILED");
  } finally {
    await session.endSession();
  }
};

/**
 * PUT /api/dashboard/menu/edit?menuItemId=<id>
 * Update a menu item based on role-based permissions
 */
export const PUT = createPutHandler(
  menuFormSchema,
  async (validatedData, request) => {
    const url = new URL(request.url);
    const menuItemId = url.searchParams.get("menuItemId");
    return await handleMenuItemEdit(validatedData, { menuItemId }, request);
  }
);

// Fallback for unsupported HTTP methods
export const { GET, POST, DELETE } = createMethodHandler(["PUT"]);
