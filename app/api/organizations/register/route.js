import mongoose from "mongoose";
import { organizationRegisterSchema } from "@/schemas/organization-schema";
import { User } from "@/models/user";
import { Organization } from "@/models/organization";
import {
  cleanUserResponse,
  createMethodHandler,
  createPostHandler,
  apiSuccess,
  notFound,
  badRequest,
  conflict,
  serverError,
} from "@/lib/api";
import { DEFAULT_PERMISSIONS } from "@/constants";

/**
 * Handle organization registration with user role elevation to admin
 */
const handleOrganizationRegistration = async (validatedData) => {
  const { userId, organizationName, businessType, information } = validatedData;

  // Start MongoDB transaction session
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      // Verify user exists and is active
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new Error("USER_NOT_FOUND");
      }

      if (user.status !== "active") {
        throw new Error("INACTIVE_USER");
      }

      if (user.organizationId) {
        throw new Error("USER_ALREADY_HAS_ORGANIZATION");
      }

      // Check for duplicate organization name
      const existingOrg = await Organization.findOne({
        name: organizationName,
      }).session(session);

      if (existingOrg) {
        throw new Error("ORGANIZATION_EXISTS");
      }

      // Generate URL-friendly slug from organization name
      const slug = organizationName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      // Create new organization with default settings
      const organization = new Organization({
        name: organizationName,
        slug,
        businessType,
        information: information || {
          address: {
            street: "123 Main Street",
            city: "New York",
            state: "NY",
            postalCode: "10001",
            country: "USA",
          },
          legalName: organizationName,
          displayName: "POS",
          orgPhone: "+1-555-0123",
          website: "https://myrestaurant.com",
          logoUrl: "https://example.com/logo.png",
          taxId: "TAX123456789",
          currency: "USD",
          timezone: "America/New_York",
          language: "en",
        },
        owner: userId,
        subscription: {
          plan: "free",
          status: "trialing",
        },
        limits: {
          users: 2,
          menuItems: 50,
          ordersPerMonth: 100,
          locations: 1,
        },
        usage: {
          currentUsers: 1,
          currentMenuItems: 0,
          ordersThisMonth: 0,
          lastResetDate: new Date(),
        },
        onboardingCompleted: true,
      });

      await organization.save({ session });

      // Update user role to admin and link to organization
      user.role = "admin";
      user.organizationId = organization._id;
      user.permissions = DEFAULT_PERMISSIONS.admin;
      user.permissionsUpdatedAt = new Date();

      await user.save({ session });
    });

    // Ensure transaction is committed before proceeding
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Fetch updated user and organization for response
    const updatedUser = await User.findById(userId).populate(
      "organizationId",
      "name slug status"
    );
    const organization = await Organization.findById(
      updatedUser.organizationId
    );

    // Clean user response data
    const userResponse = cleanUserResponse(updatedUser);

    // Normalize organization ID in response
    userResponse.organizationId =
      userResponse.organizationId?._id || userResponse.organizationId;

    return apiSuccess(
      "ORGANIZATION_REGISTERED_SUCCESSFULLY",
      {
        user: userResponse,
        organization: organization.toJSON(),
        sessionRefresh: true, // Trigger frontend session refresh
      },
      201
    );
  } catch (error) {
    // Handle specific business logic errors
    if (error.message === "USER_NOT_FOUND") {
      return notFound("USER_NOT_FOUND");
    }
    if (error.message === "INACTIVE_USER") {
      return badRequest("INACTIVE_USER");
    }
    if (error.message === "USER_ALREADY_HAS_ORGANIZATION") {
      return badRequest("USER_ALREADY_HAS_ORGANIZATION");
    }
    if (error.message === "ORGANIZATION_EXISTS") {
      return conflict("ORGANIZATION_EXISTS");
    }

    // Handle unexpected errors with handleApiError
    return serverError("OPERATION_FAILED");
  } finally {
    await session.endSession();
  }
};

/**
 * POST /api/organizations/register
 * Register a new organization and link it to a user
 */
export const POST = createPostHandler(
  organizationRegisterSchema,
  handleOrganizationRegistration
);

// Fallback for unsupported HTTP methods
export const { GET, PUT, DELETE } = createMethodHandler(["POST"]);
