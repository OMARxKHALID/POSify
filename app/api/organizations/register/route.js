import { NextResponse } from "next/server";
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
import { DefaultPermissions } from "@/constants";

// Business logic handler
const handleOrganizationRegistration = async (validatedData) => {
  const { userId, organizationName, businessType, information } = validatedData;

  // Verify user exists
  const user = await User.findById(userId);
  if (!user) return NextResponse.json(apiNotFound("User"), { status: 404 });
  if (user.status === "suspended") {
    return NextResponse.json(
      apiError("User account is suspended", "USER_SUSPENDED", [], 400),
      { status: 400 }
    );
  }

  // Check if user already belongs to an organization
  if (user.organizationId) {
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

  // Check if organization with this name already exists
  const existingOrg = await Organization.findOne({ name: organizationName });
  if (existingOrg) {
    return NextResponse.json(
      apiConflict("Organization with this name already exists"),
      { status: 409 }
    );
  }

  // Generate slug
  const slug = organizationName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

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
      currentUsers: 0,
      currentMenuItems: 0,
      ordersThisMonth: 0,
      lastResetDate: new Date(),
    },
  });

  await organization.save();

  // Link user to organization
  user.organizationId = organization._id;
  user.role = "admin";
  user.status = "active";
  user.permissions = DefaultPermissions.admin;
  user.permissionsUpdatedAt = new Date();
  await user.save();

  // Update organization usage
  organization.usage.currentUsers = 1;
  await organization.save();

  // Remove sensitive data
  const userResponse = user.toJSON();
  delete userResponse.password;
  delete userResponse.inviteToken;

  return NextResponse.json(
    apiSuccess({
      data: { user: userResponse, organization: organization.toJSON() },
      message: "Organization registered and linked to user successfully",
      statusCode: 201,
    }),
    { status: 201 }
  );
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
