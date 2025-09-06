import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { connectDB } from "@/lib/db";
import { Organization } from "@/models/organization";
import { User } from "@/models/user";
import { 
  createRouteHandler, 
  validateWithZod,
  handleApiError 
} from "@/lib/api-utils/route-helpers";
import { 
  apiSuccess, 
  apiNotFound, 
  apiUnauthorized 
} from "@/lib/api-utils/response-builder";

/**
 * GET /api/organizations
 * Fetch organization data for the authenticated user
 */
export const GET = createRouteHandler(async (request) => {
  // Get authenticated session
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(apiUnauthorized("Authentication required"), { 
      status: 401 
    });
  }

  try {
    await connectDB();

    // Find user with organization data
    const user = await User.findById(session.user.id)
      .populate({
        path: "organizationId",
        select: "-__v", // Exclude version field
      })
      .select("-password -inviteToken -__v");

    if (!user) {
      return NextResponse.json(apiNotFound("User"), { status: 404 });
    }

    if (!user.organizationId) {
      return NextResponse.json(
        apiSuccess(null, "User has no organization"), 
        { status: 200 }
      );
    }

    // Get organization with populated owner data
    const organization = await Organization.findById(user.organizationId._id)
      .populate("owner", "name email role")
      .select("-__v");

    if (!organization) {
      return NextResponse.json(apiNotFound("Organization"), { status: 404 });
    }

    // Format response data
    const organizationData = {
      ...organization.toJSON(),
      owner: {
        id: organization.owner._id,
        name: organization.owner.name,
        email: organization.owner.email,
        role: organization.owner.role,
      },
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        permissions: user.permissions,
        lastLogin: user.lastLogin,
      },
    };

    return NextResponse.json(
      apiSuccess(organizationData, "Organization data retrieved successfully"),
      { status: 200 }
    );

  } catch (error) {
    return handleApiError(error, "Failed to fetch organization data");
  }
});
