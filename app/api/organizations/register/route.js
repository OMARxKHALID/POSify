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
} from "@/lib/api";
import { DEFAULT_PERMISSIONS } from "@/constants";

// Business logic handler
const handleOrganizationRegistration = async (validatedData) => {
  const { userId, organizationName, businessType, information } = validatedData;

  console.log("🔍 [DEBUG] Starting organization registration:", {
    userId,
    organizationName,
    businessType,
    information: information ? "provided" : "not provided",
  });

  // Start a MongoDB session for transaction
  const session = await mongoose.startSession();
  console.log("🔍 [DEBUG] MongoDB session started");

  try {
    await session.withTransaction(async () => {
      console.log("🔍 [DEBUG] Starting transaction");

      // Verify user exists
      const user = await User.findById(userId).session(session);
      console.log("🔍 [DEBUG] User lookup result:", {
        found: !!user,
        userId: user?._id,
        email: user?.email,
        role: user?.role,
        status: user?.status,
        organizationId: user?.organizationId,
      });

      if (!user) {
        console.log("❌ [DEBUG] User not found");
        throw new Error("USER_NOT_FOUND");
      }
      if (user.status === "suspended") {
        console.log("❌ [DEBUG] User account is suspended");
        throw new Error("USER_SUSPENDED");
      }

      // Check if user already belongs to an organization
      if (user.organizationId) {
        console.log(
          "❌ [DEBUG] User already belongs to organization:",
          user.organizationId
        );
        throw new Error("USER_ALREADY_ORGANIZED");
      }

      // Check if organization with this name already exists
      const existingOrg = await Organization.findOne({
        name: organizationName,
      }).session(session);
      console.log("🔍 [DEBUG] Organization name check:", {
        organizationName,
        exists: !!existingOrg,
        existingOrgId: existingOrg?._id,
      });

      if (existingOrg) {
        console.log("❌ [DEBUG] Organization with this name already exists");
        throw new Error("ORGANIZATION_EXISTS");
      }

      // Generate slug
      const slug = organizationName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
      console.log("🔍 [DEBUG] Generated slug:", slug);

      // Create organization
      const organization = new Organization({
        name: organizationName,
        slug,
        businessType: businessType || "restaurant",
        status: "active",
        information: {
          legalName: organizationName,
          displayName: "POS",
          orgPhone: information?.orgPhone || "",
          email: user.email || "",
          website: information?.website || "",
          address: {
            street: information?.address?.street || "",
            city: information?.address?.city || "",
            state: information?.address?.state || "",
            postalCode: information?.address?.postalCode || "",
            country: information?.address?.country || "",
          },
          logoUrl: information?.logoUrl || "",
          taxId: information?.taxId || "",
          currency: information?.currency || "USD",
          timezone: information?.timezone || "UTC",
          language: information?.language || "en",
        },
        owner: userId,
        subscription: { plan: "free", status: "trialing" },
        limits: { users: 2, menuItems: 50, ordersPerMonth: 100, locations: 1 },
        usage: {
          currentUsers: 1, // Set to 1 since we're adding the admin user
          currentMenuItems: 0,
          ordersThisMonth: 0,
          lastResetDate: new Date(),
        },
      });

      console.log("🔍 [DEBUG] Creating organization:", {
        name: organization.name,
        slug: organization.slug,
        businessType: organization.businessType,
        owner: organization.owner,
      });

      await organization.save({ session });
      console.log(
        "✅ [DEBUG] Organization created successfully:",
        organization._id
      );

      // Link user to organization
      console.log("🔍 [DEBUG] Updating user to admin role:", {
        userId: user._id,
        currentRole: user.role,
        newRole: "admin",
        organizationId: organization._id,
      });

      user.organizationId = organization._id;
      user.role = "admin";
      user.status = "active";
      user.permissions = DEFAULT_PERMISSIONS.admin;
      user.permissionsUpdatedAt = new Date();
      await user.save({ session });
      console.log("✅ [DEBUG] User updated to admin successfully");
    });

    // If we get here, the transaction was successful
    console.log("✅ [DEBUG] Transaction completed successfully");

    // Fetch the updated user and organization
    const user = await User.findById(userId).populate("organizationId");
    const organization = await Organization.findById(user.organizationId);

    console.log("🔍 [DEBUG] Final user state:", {
      userId: user._id,
      email: user.email,
      role: user.role,
      status: user.status,
      organizationId: user.organizationId,
      organizationName: user.organizationId?.name,
    });

    console.log("🔍 [DEBUG] Final organization state:", {
      organizationId: organization._id,
      name: organization.name,
      slug: organization.slug,
      owner: organization.owner,
      status: organization.status,
    });

    // Remove sensitive data and clean up user response
    const userResponse = user.toJSON();
    delete userResponse.password;
    delete userResponse.inviteToken;

    // Only include organization ID in user response, not the full organization object
    userResponse.organizationId =
      userResponse.organizationId?._id || userResponse.organizationId;

    console.log("🔍 [DEBUG] Final user response prepared:", {
      userId: userResponse._id,
      email: userResponse.email,
      name: userResponse.name,
      role: userResponse.role,
      status: userResponse.status,
      organizationId: userResponse.organizationId,
      hasPassword: !!userResponse.password,
      hasInviteToken: !!userResponse.inviteToken,
    });

    console.log("✅ [DEBUG] Returning success response");
    return NextResponse.json(
      apiSuccess({
        data: { user: userResponse, organization: organization.toJSON() },
        message: "Organization registered and linked to user successfully",
        statusCode: 201,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.log("❌ [DEBUG] Error occurred:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    // Handle specific error cases using API utilities
    if (error.message === "USER_NOT_FOUND") {
      console.log("❌ [DEBUG] Returning USER_NOT_FOUND error");
      return NextResponse.json(apiNotFound("User"), { status: 404 });
    }
    if (error.message === "USER_SUSPENDED") {
      console.log("❌ [DEBUG] Returning USER_SUSPENDED error");
      return NextResponse.json(
        apiError("User account is suspended", "USER_SUSPENDED", [], 400),
        { status: 400 }
      );
    }
    if (error.message === "USER_ALREADY_ORGANIZED") {
      console.log("❌ [DEBUG] Returning USER_ALREADY_ORGANIZED error");
      return NextResponse.json(
        apiError(
          "User already belongs to an organization",
          "USER_ALREADY_ORGANIZED",
          [],
          400
        ),
        { status: 400 }
      );
    }
    if (error.message === "ORGANIZATION_EXISTS") {
      console.log("❌ [DEBUG] Returning ORGANIZATION_EXISTS error");
      return NextResponse.json(
        apiConflict("Organization with this name already exists"),
        { status: 409 }
      );
    }

    // Re-throw other errors to be handled by the outer catch
    console.log("❌ [DEBUG] Re-throwing unhandled error");
    throw error;
  } finally {
    console.log("🔍 [DEBUG] Ending MongoDB session");
    await session.endSession();
  }
};

// POST /api/organizations/register - Register a new organization and link it to a user
export const POST = createPostHandler(
  organizationRegisterSchema,
  async (validatedData) => {
    console.log("🚀 [DEBUG] Organization registration endpoint called");
    try {
      return await handleOrganizationRegistration(validatedData);
    } catch (error) {
      console.log("❌ [DEBUG] Outer catch block - unhandled error:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      return NextResponse.json(
        handleApiError(error, "Failed to register organization"),
        { status: 500 }
      );
    }
  }
);

// Fallback for unsupported HTTP methods
export const { GET, PUT, DELETE } = createMethodHandler(["POST"]);
