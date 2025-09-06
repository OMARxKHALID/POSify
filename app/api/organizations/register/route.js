import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { organizationRegisterSchema } from "@/schemas/organization-schema.js";
import { User } from "@/models/user.js";
import { Organization } from "@/models/organization.js";
import {
  apiSuccess,
  apiConflict,
  apiNotFound,
  apiError,
  handleApiError,
  createMethodHandler,
  createPostHandler,
} from "@/lib/api-utils";
import { DEFAULT_PERMISSIONS } from "@/constants";

// Business logic handler
const handleOrganizationRegistration = async (validatedData) => {
  const { userId, organizationName, businessType, information } = validatedData;

  // Start a MongoDB session for transaction
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      // Verify user exists
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

      // Check if organization name already exists
      const existingOrg = await Organization.findOne({
        name: organizationName,
      }).session(session);

      if (existingOrg) {
        throw new Error("ORGANIZATION_EXISTS");
      }

      // Generate slug from organization name
      const slug = organizationName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      // Create organization
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
        onboardingCompleted: true, // Mark onboarding as completed
      });

      await organization.save({ session });

      // Update user to admin role and link to organization
      user.role = "admin";
      user.organizationId = organization._id;
      user.permissions = DEFAULT_PERMISSIONS.admin;
      user.permissionsUpdatedAt = new Date();

      await user.save({ session });
    });

    // Fetch updated user and organization for response
    const updatedUser = await User.findById(userId).populate(
      "organizationId",
      "name slug status"
    );
    const organization = await Organization.findById(
      updatedUser.organizationId
    );

    // Remove sensitive data and clean up user response
    const userResponse = updatedUser.toJSON();
    delete userResponse.password;
    delete userResponse.inviteToken;

    // Only include organization ID in user response, not the full organization object
    userResponse.organizationId =
      userResponse.organizationId?._id || userResponse.organizationId;

    return NextResponse.json(
      apiSuccess({
        data: { user: userResponse, organization: organization.toJSON() },
        message: "Organization registered and linked to user successfully",
        statusCode: 201,
      }),
      { status: 201 }
    );
  } catch (error) {
    // Handle specific transaction errors
    if (error.message === "USER_NOT_FOUND") {
      return NextResponse.json(apiNotFound("User"), { status: 404 });
    }
    if (error.message === "INACTIVE_USER") {
      return NextResponse.json(
        apiError("User account is inactive", "INACTIVE_USER", [], 400),
        { status: 400 }
      );
    }
    if (error.message === "USER_ALREADY_HAS_ORGANIZATION") {
      return NextResponse.json(
        apiError(
          "User already belongs to an organization",
          "USER_ALREADY_HAS_ORGANIZATION",
          [],
          400
        ),
        { status: 400 }
      );
    }
    if (error.message === "ORGANIZATION_EXISTS") {
      return NextResponse.json(
        apiConflict("Organization with this name already exists"),
        { status: 409 }
      );
    }

    // Re-throw other errors to be handled by the outer catch
    throw error;
  } finally {
    await session.endSession();
  }
};

// POST /api/organizations/register - Register a new organization and link it to a user
export const POST = createPostHandler(
  organizationRegisterSchema,
  async (validatedData) => {
    try {
      return await handleOrganizationRegistration(validatedData);
    } catch (error) {
      return NextResponse.json(
        handleApiError(error, "Failed to register organization"),
        { status: 500 }
      );
    }
  }
);

// Fallback for unsupported HTTP methods
export const { GET, PUT, DELETE } = createMethodHandler(["POST"]);
