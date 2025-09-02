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
    await dbConnect(); // Connect to database
    const body = await request.json(); // Parse request body

    // Validate input data
    const validationResult = userRegisterSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        apiValidationError(validationResult.error.errors),
        { status: 400 }
      );
    }

    const { name, email, password } = validationResult.data;

    // Check if user with this email already exists globally
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        apiConflict("User with this email already exists"),
        { status: 409 }
      );
    }

    // Create user (without organization) - will be linked later
    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      role: "staff", // Temporary role - will be updated to admin when organization is created
      status: "active", // User is active by default
      emailVerified: true, // Email is verified by default
      permissions: [], // Default empty permissions
    });

    await user.save();

    // Remove sensitive data before response
    const userResponse = user.toJSON();
    delete userResponse.password;
    delete userResponse.inviteToken;

    return NextResponse.json(
      apiSuccess(userResponse, "User registered successfully", 201),
      { status: 201 }
    );
  } catch (error) {
    console.error("User registration error:", error);

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

    return NextResponse.json(apiInternalError("Failed to register user"), {
      status: 500,
    });
  }
}
