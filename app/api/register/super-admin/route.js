import { NextResponse } from "next/server";
import { superAdminRegisterSchema } from "@/schemas/auth-schema.js";
import { User } from "@/models/user.js";
import dbConnect from "@/lib/db.js";
import {
  apiSuccess,
  apiError,
  apiValidationError,
  apiInternalError,
  apiConflict,
} from "@/lib/api-utils.js";

/** POST /api/register/super-admin - Register a super admin user (not tied to any organization) */
export async function POST(request) {
  try {
    await dbConnect(); // Connect to database
    const body = await request.json(); // Parse request body

    // Validate input data
    const validationResult = superAdminRegisterSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        apiValidationError(validationResult.error.errors),
        { status: 400 }
      );
    }

    const { name, email, password } = validationResult.data;

    // Check if super admin already exists (limit to one super admin)
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

    // Check if user with this email already exists globally
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        apiConflict("User with this email already exists"),
        { status: 409 }
      );
    }

    // Create super admin user with full system access
    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      role: "super_admin",
      status: "active", // Super admin is active by default
      emailVerified: true, // Super admin email is verified by default
      permissions: ["*"], // Super admin has all permissions
    });

    await user.save();

    // Remove sensitive data before response
    const userResponse = user.toJSON();
    delete userResponse.password;
    delete userResponse.inviteToken;

    return NextResponse.json(
      apiSuccess(userResponse, "Super admin registered successfully", 201),
      { status: 201 }
    );
  } catch (error) {
    console.error("Super admin registration error:", error);

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
      apiInternalError("Failed to register super admin"),
      { status: 500 }
    );
  }
}
