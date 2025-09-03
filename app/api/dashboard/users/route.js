import { NextResponse } from "next/server";
import { User } from "@/models/user.js";
import { apiSuccess, apiError, createGetHandler } from "@/lib/api";

// Business logic handler for GET users
const handleGetUsers = async (queryParams) => {
  const { organizationId, page = 1, limit = 10, search } = queryParams;

  if (!organizationId) {
    return NextResponse.json(
      apiError("Organization ID is required", "MISSING_ORG_ID", [], 400),
      { status: 400 }
    );
  }

  // Build query
  const query = { organizationId };
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  // Get users with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const users = await User.find(query)
    .select("-password -inviteToken")
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(query);

  return NextResponse.json(
    apiSuccess({
      data: users,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
      message: "Users retrieved successfully",
    }),
    { status: 200 }
  );
};

// GET /api/dashboard/users - Get users for an organization
export const GET = createGetHandler(handleGetUsers);

// Fallback for unsupported HTTP methods
export const { POST, PUT, DELETE } = createMethodHandler(["GET"]);
