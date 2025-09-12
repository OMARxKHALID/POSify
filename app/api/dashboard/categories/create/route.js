import { Category } from "@/models/category";
import { categoryFormSchema } from "@/schemas/category-schema";
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
 * Handle category creation with admin permissions and organization validation
 */
const handleCategoryCreation = async (validatedData, request) => {
  const { name, icon, image, description, isActive } = validatedData;
  const currentUser = await getAuthenticatedUser();

  // Only admin can create categories
  if (!hasRole(currentUser, ["admin"])) {
    return forbidden("INSUFFICIENT_PERMISSIONS");
  }

  // Validate organization exists
  const organization = await validateOrganizationExists(currentUser);
  if (!organization || organization.error) return organization;

  // Check for duplicate category name within the organization
  const existingCategory = await Category.findOne({
    organizationId: currentUser.organizationId,
    name: name.trim(),
  });

  if (existingCategory) {
    return badRequest("CATEGORY_NAME_EXISTS");
  }

  try {
    const newCategory = new Category({
      organizationId: currentUser.organizationId,
      name: name.trim(),
      icon: icon?.trim() || "",
      image: image?.trim() || "",
      description: description?.trim() || "",
      isActive: isActive ?? true,
      createdBy: currentUser._id,
    });

    await newCategory.save();
    await logCreate("Category", newCategory, currentUser, request);

    // Format category for response
    const categoryResponse = formatCategoryData(newCategory);

    return apiSuccess("CATEGORY_CREATED_SUCCESSFULLY", categoryResponse, 201);
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return badRequest(`VALIDATION_ERROR: ${validationErrors.join(", ")}`);
    }
    if (error.code === 11000) {
      return badRequest("CATEGORY_NAME_EXISTS");
    }
    return serverError("CATEGORY_CREATION_FAILED");
  }
};

/**
 * POST /api/dashboard/categories/create
 * Create a new category (admin only)
 */
export const POST = createPostHandler(
  categoryFormSchema,
  handleCategoryCreation
);

// Fallback for unsupported HTTP methods
export const { GET, PUT, DELETE } = createMethodHandler(["POST"]);
