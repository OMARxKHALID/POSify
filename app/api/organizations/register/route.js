import { NextResponse } from "next/server";
import { organizationRegisterSchema } from "@/schemas/organization-schema.js";
import { User } from "@/models/user.js";
import { Organization } from "@/models/organization.js";
import dbConnect from "@/lib/db.js";
import ResponseBuilder, {
  apiSuccess,
  apiFromZod,
  apiFromMongoose,
  apiInternalError,
  apiConflict,
  apiNotFound,
  apiError,
} from "@/lib/api-utils.js";
import { DefaultPermissions } from "@/constants";

// POST /api/organizations/register - Register a new organization and link it to a user
export async function POST(request) {
  try {
    // Connect to database
    await dbConnect();

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        apiError("Invalid JSON payload", "INVALID_JSON", [], 400),
        { status: 400 }
      );
    }

    // Validate input data (Zod)
    const validationResult = organizationRegisterSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(apiFromZod(validationResult.error), {
        status: 400,
      });
    }

    const { userId, organizationName, businessType, information } =
      validationResult.data;

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
        phone: information?.phone || "",
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
  } catch (error) {
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        ResponseBuilder.error({
          message: `${field} already exists`,
          code: "DUPLICATE_KEY",
          details: [{ field, issue: `${field} must be unique` }],
          statusCode: 409,
        }),
        { status: 409 }
      );
    }

    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      return NextResponse.json(apiFromMongoose(error), { status: 400 });
    }

    // Handle invalid object IDs
    if (error.name === "CastError") {
      return NextResponse.json(
        apiError("Invalid resource identifier", "CAST_ERROR", [], 400),
        { status: 400 }
      );
    }

    // Handle database connection errors
    if (
      error.name === "MongoNetworkError" ||
      error.name === "MongoServerSelectionError"
    ) {
      return NextResponse.json(
        ResponseBuilder.error({
          message: "Database connection failed",
          code: "DB_CONNECTION_ERROR",
          statusCode: 503,
        }),
        { status: 503 }
      );
    }

    // Handle timeout errors
    if (error.message && error.message.includes("timed out")) {
      return NextResponse.json(
        apiError("Database request timed out", "DB_TIMEOUT", [], 504),
        { status: 504 }
      );
    }

    // Handle unexpected errors
    return NextResponse.json(
      apiInternalError("Failed to register organization"),
      { status: 500 }
    );
  }
}

// Fallback for unsupported HTTP methods
export function GET() {
  return NextResponse.json(
    apiError("Method not allowed", "METHOD_NOT_ALLOWED", [], 405),
    { status: 405 }
  );
}

export function PUT() {
  return NextResponse.json(
    apiError("Method not allowed", "METHOD_NOT_ALLOWED", [], 405),
    { status: 405 }
  );
}

export function DELETE() {
  return NextResponse.json(
    apiError("Method not allowed", "METHOD_NOT_ALLOWED", [], 405),
    { status: 405 }
  );
}
