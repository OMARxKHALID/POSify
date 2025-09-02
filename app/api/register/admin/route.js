import { NextResponse } from "next/server";
import { adminRegisterSchema } from "@/schemas/auth-schema.js";
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

/** POST /api/register/admin - Register an admin/staff user in an existing organization */
export async function POST(request) {
  try {
    await dbConnect(); // Connect to database
    const body = await request.json(); // Parse request body

    // Validate input data
    const validationResult = adminRegisterSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        apiValidationError(validationResult.error.errors),
        { status: 400 }
      );
    }

    const {
      name,
      email,
      password,
      organizationId,
      role = "admin",
    } = validationResult.data;

    // Verify organization exists and is active
    const organization = await Organization.findById(organizationId);
    if (!organization)
      return NextResponse.json(apiNotFound("Organization"), { status: 404 });
    if (organization.status !== "active") {
      return NextResponse.json(
        apiError(
          "Organization is not active",
          "ORGANIZATION_INACTIVE",
          [],
          400
        ),
        { status: 400 }
      );
    }

    // Check if user already exists in this organization
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
      organizationId,
    });
    if (existingUser) {
      return NextResponse.json(
        apiConflict("User with this email already exists in this organization"),
        { status: 409 }
      );
    }

    // Check organization user limits
    if (organization.usage.currentUsers >= organization.limits.users) {
      return NextResponse.json(
        apiError(
          "Organization has reached maximum user limit",
          "USER_LIMIT_EXCEEDED",
          [],
          400
        ),
        { status: 400 }
      );
    }

    // Create user with organization link
    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      role,
      organizationId,
      status: "invited", // Default status for new registrations
      emailVerified: false, // Will be verified when they accept invitation
      permissions: [], // Default empty permissions
    });

    await user.save();

    // Update organization usage
    organization.usage.currentUsers += 1;
    await organization.save();

    // Remove sensitive data before response
    const userResponse = user.toJSON();
    delete userResponse.password;
    delete userResponse.inviteToken;

    return NextResponse.json(
      apiSuccess(userResponse, "Admin user registered successfully", 201),
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin registration error:", error);

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
      apiInternalError("Failed to register admin user"),
      { status: 500 }
    );
  }
}
