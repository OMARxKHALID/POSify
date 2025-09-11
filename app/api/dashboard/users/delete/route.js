import { User } from "@/models/user";
import { Organization } from "@/models/organization";
import { logDelete } from "@/lib/helpers/audit-helpers";
import {
  getAuthenticatedUser,
  cleanUserResponse,
  createMethodHandler,
  createDeleteHandler,
  apiSuccess,
  notFound,
  forbidden,
  serverError,
  badRequest,
} from "@/lib/api";

/**
 * Handle user deletion with role-based permissions and organization scoping
 */
const handleUserDelete = async (queryParams, request) => {
  const { userId } = queryParams;
  const currentUser = await getAuthenticatedUser();

  // Find target user to delete
  const targetUser = await User.findById(userId).select(
    "-password -inviteToken -__v"
  );
  if (!targetUser) {
    return notFound("TARGET_USER_NOT_FOUND");
  }

  // Check if user is deleting themselves
  const isSelfDelete = currentUser._id.toString() === targetUser._id.toString();

  // Apply role-based permission checks
  if (currentUser.role === "staff") {
    // Staff have no delete permissions
    return forbidden("INSUFFICIENT_PERMISSIONS");
  } else if (currentUser.role === "admin") {
    // Admin can only delete staff in their organization
    if (
      !currentUser.organizationId ||
      !targetUser.organizationId ||
      currentUser.organizationId.toString() !==
        targetUser.organizationId.toString()
    ) {
      return forbidden("INSUFFICIENT_PERMISSIONS");
    }

    // Prevent admin from deleting other admins or themselves
    if (targetUser.role === "admin" || isSelfDelete) {
      return forbidden("CANNOT_DELETE_ADMIN");
    }
  } else if (currentUser.role === "super_admin") {
    // Super admin can delete anyone except themselves
    if (isSelfDelete) {
      return forbidden("CANNOT_DELETE_SELF");
    }

    // Check if admin is organization owner
    if (targetUser.role === "admin" && targetUser.organizationId) {
      const organization = await Organization.findById(
        targetUser.organizationId
      ).select("owner name");

      if (
        organization &&
        organization.owner.toString() === targetUser._id.toString()
      ) {
        // Check if there are other staff in the organization
        const staffCount = await User.countDocuments({
          organizationId: targetUser.organizationId,
          role: "staff",
          _id: { $ne: targetUser._id },
        });

        if (staffCount === 0) {
          return badRequest("CANNOT_DELETE_ORG_OWNER_NO_STAFF");
        } else {
          return badRequest("CANNOT_DELETE_ORG_OWNER_HAS_STAFF");
        }
      }
    }
  } else {
    // Pending users have no delete permissions
    return forbidden("INSUFFICIENT_PERMISSIONS");
  }

  // Check for critical dependencies before deletion
  // For now, we'll allow deletion but this could be extended to check for dependencies

  // Store user data for audit trail
  const userToDelete = { ...targetUser.toObject() };

  // Delete user from database
  let deletedUser;
  try {
    deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return serverError("DELETE_FAILED");
    }
  } catch (error) {
    return serverError("DELETE_FAILED");
  }

  // Log user deletion for audit trail
  try {
    await logDelete("User", userToDelete, currentUser, request);
  } catch (auditError) {
    // Don't fail the deletion if audit logging fails
  }

  // Clean user response data
  const userResponse = cleanUserResponse(deletedUser);

  return apiSuccess("USER_DELETED_SUCCESSFULLY", userResponse);
};

/**
 * DELETE /api/dashboard/users/delete?userId=<id>
 * Delete a user based on role-based permissions
 */
export const DELETE = createDeleteHandler(handleUserDelete);

// Fallback for unsupported HTTP methods
export const { GET, POST, PUT } = createMethodHandler(["DELETE"]);
