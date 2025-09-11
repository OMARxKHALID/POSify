import mongoose from "mongoose";
import { Menu } from "@/models/menu";
import { Category } from "@/models/category";
import { menuSchema } from "@/schemas/menu-schema";
import { logUpdate } from "@/lib/helpers/audit-helpers";
import {
  getAuthenticatedUser,
  hasRole,
  createMethodHandler,
  createPutHandler,
  apiSuccess,
  badRequest,
  notFound,
  forbidden,
  serverError,
  validateOrganizationExists,
} from "@/lib/api";

/**
 * Handle menu item editing with role-based permissions and validation
 */
const handleMenuItemEdit = async (validatedData, queryParams, request) => {
  try {
    const { menuItemId } = queryParams;
    const updateData = validatedData;
    const currentUser = await getAuthenticatedUser();

    // Only admin and super_admin can edit menu items
    if (!hasRole(currentUser, ["admin", "super_admin"])) {
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

  // Role-based organization checks
  if (currentUser.role === "admin") {
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
  }

  // Validate category if being updated
  if (updateData.category) {
    const categoryDoc = await Category.findById(updateData.category);
    if (!categoryDoc) {
      return badRequest("CATEGORY_NOT_FOUND");
    }

    // For admin users, ensure category belongs to their organization
    if (currentUser.role === "admin") {
      if (
        !categoryDoc.organizationId ||
        categoryDoc.organizationId.toString() !==
          currentUser.organizationId.toString()
      ) {
        return forbidden("CATEGORY_NOT_IN_ORGANIZATION");
      }
    }
  }

  // Check for duplicate menu item name within the same organization
  if (updateData.name && updateData.name !== targetMenuItem.name) {
    const existingMenuItem = await Menu.findOne({
      organizationId: targetMenuItem.organizationId,
      name: { $regex: new RegExp(`^${updateData.name}$`, "i") },
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
  if (updateData.tags) {
    updateData.tags = updateData.tags
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
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
    const updatedMenuItem = await Menu.findById(menuItemId)
      .populate("category", "name icon")
      .populate("organizationId", "name");

    const menuResponse = {
      id: updatedMenuItem._id,
      name: updatedMenuItem.name,
      description: updatedMenuItem.description,
      price: updatedMenuItem.price,
      image: updatedMenuItem.image,
      icon: updatedMenuItem.icon,
      available: updatedMenuItem.available,
      prepTime: updatedMenuItem.prepTime,
      isSpecial: updatedMenuItem.isSpecial,
      displayOrder: updatedMenuItem.displayOrder,
      tags: updatedMenuItem.tags,
      category: updatedMenuItem.category,
      organizationId: updatedMenuItem.organizationId,
      createdAt: updatedMenuItem.createdAt,
      updatedAt: updatedMenuItem.updatedAt,
    };

    return apiSuccess("MENU_ITEM_UPDATED_SUCCESSFULLY", menuResponse);
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
  menuSchema,
  async (validatedData, request) => {
    const url = new URL(request.url);
    const menuItemId = url.searchParams.get("menuItemId");
    return await handleMenuItemEdit(validatedData, { menuItemId }, request);
  }
);

// Fallback for unsupported HTTP methods
export const { GET, POST, DELETE } = createMethodHandler(["PUT"]);
