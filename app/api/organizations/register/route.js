import { NextResponse } from "next/server";
import { organizationRegisterSchema } from "@/schemas/organization-schema.js";
import { User } from "@/models/user.js";
import { Organization } from "@/models/organization.js";
import dbConnect from "@/lib/db.js";
import {
  apiSuccess,
  apiError,
  apiValidationError,
  apiInternalError,
  apiConflict,
  apiNotFound,
} from "@/lib/api-utils.js";

/** POST /api/organizations/register - Register a new organization and link it to an existing user */
export async function POST(request) {
  try {
    await dbConnect(); // Connect to database
    const body = await request.json(); // Parse request body

    // Validate input data
    const validationResult = organizationRegisterSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        apiValidationError(validationResult.error.errors),
        { status: 400 }
      );
    }

    const { userId, organizationName, businessType } = validationResult.data;

    // Verify user exists and is active
    const user = await User.findById(userId);
    if (!user) return NextResponse.json(apiNotFound("User"), { status: 404 });
    if (user.status !== "active") {
      return NextResponse.json(
        apiError("User is not active", "USER_INACTIVE", [], 400),
        { status: 400 }
      );
    }

    // Check if user already has an organization
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

    // Create organization with default settings
    const organization = new Organization({
      name: organizationName,
      slug: organizationName.toLowerCase().replace(/\s+/g, "-"),
      businessType: businessType || "restaurant",
      status: "active",
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

    // Link user to organization and promote to admin
    user.organizationId = organization._id;
    user.role = "admin"; // First user becomes admin
    user.permissions = ["*"]; // Admin has all permissions
    await user.save();

    // Update organization usage
    organization.usage.currentUsers = 1;
    await organization.save();

    // Remove sensitive data before response
    const userResponse = user.toJSON();
    delete userResponse.password;
    delete userResponse.inviteToken;

    return NextResponse.json(
      apiSuccess(
        { user: userResponse, organization: organization.toJSON() },
        "Organization registered and linked to user successfully",
        201
      ),
      { status: 201 }
    );
  } catch (error) {
    console.error("Organization registration error:", error);

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        apiError(
          `${field} already exists`,
          "DUPLICATE_KEY",
          [{ field, issue: `${field} must be unique` }],
          409
        ),
        { status: 409 }
      );
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err) => ({
        field: err.path,
        issue: err.message,
      }));
      return NextResponse.json(apiValidationError(validationErrors), {
        status: 400,
      });
    }

    return NextResponse.json(
      apiInternalError("Failed to register organization"),
      { status: 500 }
    );
  }
}
