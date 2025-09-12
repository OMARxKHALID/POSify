import { Menu } from "@/models/menu";
import { Category } from "@/models/category";
import { menuFormSchema } from "@/schemas/menu-schema";
import { formatCategoryForAPI } from "@/lib/utils/category-utils";
import { formatMenuItemForAPI } from "@/lib/utils/menu-utils";
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

// Using utility function for consistent formatting
const formatMenuData = formatMenuItemForAPI;

/**
 * Handle menu item creation with admin permissions and organization validation
 */
const handleMenuItemCreation = async (validatedData, request) => {
  const {
    name,
    price,
    description,
    image,
    icon,
    available = true,
    prepTime,
    isSpecial = false,
  } = validatedData;

  // Extract categoryId separately and handle "uncategorized" case
  const { categoryId } = validatedData;

  const currentUser = await getAuthenticatedUser();

  // Only admin can create menu items
  if (!hasRole(currentUser, ["admin"])) {
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
  const existingMenuItem = await Menu.findOne({
    organizationId: currentUser.organizationId,
    name: name.trim(),
  });

  if (existingMenuItem) {
    return badRequest("MENU_ITEM_NAME_EXISTS");
  }

  try {
    const newMenuItem = new Menu({
      organizationId: currentUser.organizationId,
      categoryId, // This will be undefined if "uncategorized" due to schema transform
      name: name.trim(),
      price,
      description: description?.trim(),
      image: image?.trim(),
      icon: icon?.trim(),
      available,
      prepTime,
      isSpecial,
      createdBy: currentUser._id,
    });

    await newMenuItem.save();
    await logCreate("Menu", newMenuItem, currentUser, request);

    // Format menu item for response
    const menuResponse = formatMenuData(newMenuItem);
    const formattedCategories = categories.map(formatCategoryForAPI);

    return apiSuccess(
      "MENU_ITEM_CREATED_SUCCESSFULLY",
      {
        menuItem: menuResponse,
        categories: formattedCategories,
      },
      201
    );
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return badRequest(`VALIDATION_ERROR: ${validationErrors.join(", ")}`);
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return badRequest("MENU_ITEM_NAME_EXISTS");
    }

    return serverError("MENU_ITEM_CREATION_FAILED");
  }
};

/**
 * POST /api/dashboard/menu/create
 * Create a new menu item (admin only)
 */
export const POST = createPostHandler(menuFormSchema, handleMenuItemCreation);

// Fallback for unsupported HTTP methods
export const { GET, PUT, DELETE } = createMethodHandler(["POST"]);
