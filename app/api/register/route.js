import { NextResponse } from "next/server";
import { userRegisterSchema } from "@/schemas/auth-schema.js";
import { User } from "@/models/user.js";
import dbConnect from "@/lib/db.js";
import {
  apiSuccess,
  apiError,
  apiValidationError,
  apiInternalError,
  apiConflict,
} from "@/lib/api-utils.js";

/** POST /api/register - Register a new user (without organization) */
export async function POST(request) {
  try {
    console.log("🔐 User registration request received");

    // Connect to database
    await dbConnect();
    console.log("✅ Database connected successfully");

    // Parse request body
    const body = await request.json();
    console.log("📝 Request body parsed:", {
      name: body.name,
      email: body.email,
    });

    // Validate input data
    const validationResult = userRegisterSchema.safeParse(body);
    if (!validationResult.success) {
      console.log("❌ Validation failed:", validationResult.error.errors);
      return NextResponse.json(
        apiValidationError(validationResult.error.errors),
        { status: 400 }
      );
    }
    console.log("✅ Validation passed");

    const { name, email, password } = validationResult.data;

    // Check if user with this email already exists globally
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log("❌ User already exists:", email);
      return NextResponse.json(
        apiConflict("User with this email already exists"),
        { status: 409 }
      );
    }
    console.log("✅ Email is unique");

    // Create user (without organization) - will be linked later
    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      role: "pending", // Temporary role - will be updated to admin when organization is created
      status: "active", // User is active by default
      emailVerified: true, // Email is verified by default
      permissions: [], // Default empty permissions
    });

    await user.save();
    console.log("✅ User saved to database:", user._id);

    // Remove sensitive data before response
    const userResponse = user.toJSON();
    delete userResponse.password;
    delete userResponse.inviteToken;

    const response = apiSuccess(
      userResponse,
      "User registered successfully",
      201
    );
    console.log("✅ Registration successful, sending response");

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("💥 User registration error:", error);
    console.error("Error stack:", error.stack);

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      console.log("❌ Duplicate key error:", field);
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
      console.log("❌ Mongoose validation error:", validationErrors);
      return NextResponse.json(apiValidationError(validationErrors), {
        status: 400,
      });
    }

    // Handle database connection errors
    if (
      error.name === "MongoNetworkError" ||
      error.name === "MongoServerSelectionError"
    ) {
      console.error("❌ Database connection error:", error.message);
      return NextResponse.json(
        apiError("Database connection failed", "DB_CONNECTION_ERROR", [], 503),
        { status: 503 }
      );
    }

    // Handle other errors
    console.error("❌ Unexpected error:", error.message);
    return NextResponse.json(
      apiInternalError("Failed to register user. Please try again."),
      { status: 500 }
    );
  }
}
