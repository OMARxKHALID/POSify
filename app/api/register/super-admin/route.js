import { NextResponse } from "next/server";
import { superAdminRegisterSchema } from "@/schemas/auth-schema.js";
import { User } from "@/models/user.js";
import dbConnect from "@/lib/db.js";
import ResponseBuilder, {
  apiSuccess,
  apiFromZod,
  apiFromMongoose,
  apiInternalError,
  apiConflict,
  apiError,
} from "@/lib/api-utils.js";
import { DefaultPermissions } from "@/constants";

// POST /api/register/super-admin - Register a super admin user
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
    const validationResult = superAdminRegisterSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(apiFromZod(validationResult.error), {
        status: 400,
      });
    }

    const { name, email, password } = validationResult.data;

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ role: "super_admin" });
    if (existingSuperAdmin) {
      return NextResponse.json(
        apiError(
          "Super admin already exists",
          "SUPER_ADMIN_EXISTS",
          [
            {
              field: "role",
              issue: "Only one super admin is allowed in the system",
            },
          ],
          409
        ),
        { status: 409 }
      );
    }

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        apiConflict("User with this email already exists"),
        { status: 409 }
      );
    }

    // Create and save super admin
    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      role: "super_admin",
      status: "active",
      emailVerified: true,
      permissions: DefaultPermissions.superAdmin,
      permissionsUpdatedAt: new Date(),
    });

    await user.save();

    // Remove sensitive data
    const userResponse = user.toJSON();
    delete userResponse.password;
    delete userResponse.inviteToken;

    return NextResponse.json(
      apiSuccess({
        data: userResponse,
        message: "Super admin registered successfully",
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
      apiInternalError("Failed to register super admin"),
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
