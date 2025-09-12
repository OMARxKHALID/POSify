import mongoose from "mongoose";
import { Category } from "@/models/category";
import { categoryFormSchema } from "@/schemas/category-schema";
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
 * Handle category editing with role-based permissions and validation
 */
const handleCategoryEdit = async (validatedData, queryParams, request) => {
  const { categoryId } = queryParams;
  const updateData = validatedData;
  const currentUser = await getAuthenticatedUser();

  // Only admin can edit categories
  if (!hasRole(currentUser, ["admin"])) {
    return forbidden("INSUFFICIENT_PERMISSIONS");
  }

  // Validate category ID parameter
  if (!categoryId || typeof categoryId !== "string") {
    return badRequest("INVALID_CATEGORY_ID");
  }

  // Find target category
  const targetCategory = await Category.findById(categoryId);
  if (!targetCategory) {
    return notFound("CATEGORY_NOT_FOUND");
  }

  // Admin can only edit categories from their organization
  if (
    !currentUser.organizationId ||
    !targetCategory.organizationId ||
    currentUser.organizationId.toString() !==
      targetCategory.organizationId.toString()
  ) {
    return forbidden("INSUFFICIENT_PERMISSIONS");
  }

  // Validate organization exists
  const organization = await validateOrganizationExists(currentUser);
  if (!organization || organization.error) return organization;

  // Check for duplicate category name within the organization
  if (updateData.name && updateData.name !== targetCategory.name) {
    const existingCategory = await Category.findOne({
      organizationId: targetCategory.organizationId,
      name: updateData.name.trim(),
      _id: { $ne: categoryId },
    });

    if (existingCategory) {
      return badRequest("CATEGORY_NAME_EXISTS");
    }
  }

  // Clean and prepare update data
  if (updateData.name) {
    updateData.name = updateData.name.trim();
  }
  if (updateData.icon) {
    updateData.icon = updateData.icon.trim();
  }
  if (updateData.image) {
    updateData.image = updateData.image.trim();
  }
  if (updateData.description) {
    updateData.description = updateData.description.trim();
  }

  updateData.lastModifiedBy = currentUser._id;

  const oldCategory = targetCategory.toObject
    ? targetCategory.toObject()
    : targetCategory;

  // Update category with transaction
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const updatedCategory = await Category.findByIdAndUpdate(
        categoryId,
        updateData,
        {
          new: true,
          runValidators: true,
          session,
        }
      );

      if (!updatedCategory) {
        throw new Error("UPDATE_FAILED");
      }

      await logUpdate(
        "Category",
        oldCategory,
        updatedCategory,
        currentUser,
        request
      );
    });

    // Fetch updated category after transaction
    const updatedCategory = await Category.findById(categoryId);
    const categoryResponse = formatCategoryData(updatedCategory);

    return apiSuccess("CATEGORY_UPDATED_SUCCESSFULLY", categoryResponse);
  } catch (error) {
    return serverError("UPDATE_FAILED");
  } finally {
    await session.endSession();
  }
};

/**
 * PUT /api/dashboard/categories/edit?categoryId=<id>
 * Update a category based on role-based permissions
 */
export const PUT = createPutHandler(
  categoryFormSchema,
  async (validatedData, request) => {
    const url = new URL(request.url);
    const categoryId = url.searchParams.get("categoryId");
    return await handleCategoryEdit(validatedData, { categoryId }, request);
  }
);

export const { GET, POST, DELETE } = createMethodHandler(["PUT"]);
