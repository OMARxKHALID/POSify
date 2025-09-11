import mongoose from "mongoose";
import { Menu } from "@/models/menu";
import { Category } from "@/models/category";
import { menuSchema } from "@/schemas/menu-schema";
import { logCreate } from "@/lib/helpers/audit-helpers";
import {
  getAuthenticatedUser,
  hasRole,
  createMethodHandler,
  createPostHandler,
  apiSuccess,
  forbidden,
  badRequest,
  serverError,
  validateOrganizationExists,
} from "@/lib/api";

/**
 * Handle menu item creation with admin permissions and organization validation
 */
const handleMenuItemCreation = async (validatedData, request) => {
  try {
    const {
      category,
      name,
      price,
      description,
      image,
      icon,
      available = true,
      prepTime,
      isSpecial = false,
      displayOrder = 0,
      tags = [],
    } = validatedData;
    const currentUser = await getAuthenticatedUser();

    // Only admin and super_admin can create menu items
    if (!hasRole(currentUser, ["admin", "super_admin"])) {
      return forbidden("INSUFFICIENT_PERMISSIONS");
    }

  // Validate organization exists for admin users
  if (currentUser.role === "admin") {
    const organization = await validateOrganizationExists(currentUser);
    if (!organization || organization.error) return organization;
  }

  // Validate category exists and belongs to the organization
  const categoryDoc = await Category.findById(category);
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

  // Check for duplicate menu item name within the same organization
  const existingMenuItem = await Menu.findOne({
    organizationId:
      currentUser.role === "admin"
        ? currentUser.organizationId
        : categoryDoc.organizationId,
    name: { $regex: new RegExp(`^${name}$`, "i") },
  });

  if (existingMenuItem) {
    return badRequest("MENU_ITEM_NAME_EXISTS");
  }

  try {
    const newMenuItem = new Menu({
      organizationId:
        currentUser.role === "admin"
          ? currentUser.organizationId
          : categoryDoc.organizationId,
      category,
      name: name.trim(),
      price,
      description: description?.trim(),
      image: image?.trim(),
      icon: icon?.trim(),
      available,
      prepTime,
      isSpecial,
      displayOrder,
      tags: tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0),
      createdBy: currentUser._id,
    });

    await newMenuItem.save();
    await logCreate("Menu", newMenuItem, currentUser, request);

    // Populate the created menu item for response
    const populatedMenuItem = await Menu.findById(newMenuItem._id)
      .populate("category", "name icon")
      .populate("organizationId", "name");

    const menuResponse = {
      id: populatedMenuItem._id,
      name: populatedMenuItem.name,
      description: populatedMenuItem.description,
      price: populatedMenuItem.price,
      image: populatedMenuItem.image,
      icon: populatedMenuItem.icon,
      available: populatedMenuItem.available,
      prepTime: populatedMenuItem.prepTime,
      isSpecial: populatedMenuItem.isSpecial,
      displayOrder: populatedMenuItem.displayOrder,
      tags: populatedMenuItem.tags,
      category: populatedMenuItem.category,
      organizationId: populatedMenuItem.organizationId,
      createdAt: populatedMenuItem.createdAt,
      updatedAt: populatedMenuItem.updatedAt,
    };

    return apiSuccess("MENU_ITEM_CREATED_SUCCESSFULLY", menuResponse, 201);
  } catch (error) {
    return serverError("MENU_ITEM_CREATION_FAILED");
  }
};

/**
 * POST /api/dashboard/menu/create
 * Create a new menu item (admin/super_admin only)
 */
export const POST = createPostHandler(menuSchema, handleMenuItemCreation);

// Fallback for unsupported HTTP methods
export const { GET, PUT, DELETE } = createMethodHandler(["POST"]);
