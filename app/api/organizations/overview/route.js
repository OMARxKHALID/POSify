import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { Organization } from "@/models/organization";
import { User } from "@/models/user";
import { getApiErrorMessages } from "@/lib/helpers/error-messages";
import {
  apiSuccess,
  apiNotFound,
  apiError,
  handleApiError,
  createMethodHandler,
  createGetRouteHandler,
} from "@/lib/api-utils";

/**
 * Format user data for response
 */
const formatUserData = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  permissions: user.permissions,
  lastLogin: user.lastLogin,
  createdAt: user.createdAt,
});

/**
 * Business logic handler for organization overview
 * Returns comprehensive user and organization data
 */
const handleOrganizationOverview = async (queryParams, request) => {
  // Get authenticated session
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("AUTHENTICATION_REQUIRED");
  }

  // Find user with basic info
  const user = await User.findById(session.user.id).select(
    "-password -inviteToken -__v"
  );

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  // For super_admin users, return user info without organization
  if (user.role === "super_admin") {
    const userData = {
      user: formatUserData(user),
      organization: null,
      isOwner: false,
    };

    return NextResponse.json(
      apiSuccess({
        data: userData,
        message: "User overview retrieved successfully",
      }),
      { status: 200 }
    );
  }

  // For admin/staff users, get organization data
  if (!user.organizationId) {
    return NextResponse.json(
      apiSuccess({
        data: {
          user: formatUserData(user),
          organization: null,
          isOwner: false,
        },
        message: "User has no organization",
      }),
      { status: 200 }
    );
  }

  // Get organization with populated owner data
  const organization = await Organization.findById(user.organizationId)
    .populate("owner", "name email role status lastLogin createdAt")
    .select("-__v");

  if (!organization) {
    throw new Error("ORGANIZATION_NOT_FOUND");
  }

  // Check if current user is the owner
  const isOwner = organization.owner._id.toString() === user._id.toString();

  // Format response data
  const overviewData = {
    user: formatUserData(user),
    organization: {
      id: organization._id,
      name: organization.name,
      slug: organization.slug,
      domain: organization.domain,
      status: organization.status,
      businessType: organization.businessType,
      information: organization.information,
      subscription: organization.subscription,
      limits: organization.limits,
      usage: organization.usage,
      onboardingCompleted: organization.onboardingCompleted,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
      owner: {
        id: organization.owner._id,
        name: organization.owner.name,
        email: organization.owner.email,
        role: organization.owner.role,
        status: organization.owner.status,
        lastLogin: organization.owner.lastLogin,
        createdAt: organization.owner.createdAt,
      },
    },
    isOwner,
  };

  return NextResponse.json(
    apiSuccess({
      data: overviewData,
      message: "Organization overview retrieved successfully",
    }),
    { status: 200 }
  );
};

/**
 * GET /api/organizations/overview
 * Get comprehensive overview of the authenticated user and their organization
 * Returns user info, role, and organization details
 */
export const GET = createGetRouteHandler(async (queryParams, request) => {
  try {
    return await handleOrganizationOverview(queryParams, request);
  } catch (error) {
    // Handle specific authentication and data errors
    switch (error.message) {
      case "AUTHENTICATION_REQUIRED":
        return NextResponse.json(
          apiError(getApiErrorMessages("AUTHENTICATION_REQUIRED")),
          {
            status: 401,
          }
        );
      case "USER_NOT_FOUND":
        return NextResponse.json(
          apiNotFound(getApiErrorMessages("USER_NOT_FOUND")),
          { status: 404 }
        );
      case "ORGANIZATION_NOT_FOUND":
        return NextResponse.json(
          apiNotFound(getApiErrorMessages("ORGANIZATION_NOT_FOUND")),
          { status: 404 }
        );
      default:
        // Handle other errors
        return NextResponse.json(
          handleApiError(error, getApiErrorMessages("OPERATION_FAILED")),
          { status: 500 }
        );
    }
  }
});

// Fallback for unsupported HTTP methods
export const { POST, PUT, DELETE } = createMethodHandler(["GET"]);
