import CredentialsProvider from "next-auth/providers/credentials";
import { loginSchema } from "@/schemas/auth-schema";
import { User } from "@/models/user";
import { Organization } from "@/models/organization";
import { AUTH_ROUTES, SESSION_CONFIG, COOKIE_CONFIG } from "@/constants";
import dbConnect from "./db";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          await dbConnect();

          // Validate input
          const parsed = loginSchema.safeParse(credentials);
          if (!parsed.success) {
            throw new Error("VALIDATION_ERROR");
          }

          const { email, password } = parsed.data;

          // Find user by email
          const user = await User.findOne({
            email: email.toLowerCase(),
          });

          if (!user) {
            throw new Error("INVALID_CREDENTIALS");
          }

          // Check user status
          if (user.status !== "active") {
            throw new Error("INACTIVE_ACCOUNT");
          }

          // Verify password
          const isValid = await user.comparePassword(password);
          if (!isValid) {
            throw new Error("INVALID_CREDENTIALS");
          }

          // Get organization data if user has one
          let organization = null;
          if (user.organizationId) {
            organization = await Organization.findById(user.organizationId);
            if (!organization) {
              throw new Error("ORGANIZATION_NOT_FOUND");
            }
          }

          // Update last login
          user.lastLogin = new Date();
          await user.save();

          // Return user data for session
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status,
            organizationId: user.organizationId?.toString() || null,
            organizationName: organization?.name || null,
            onboardingCompleted: organization?.onboardingCompleted || false,
            permissions: user.permissions || [],
          };
        } catch (err) {
          // Only expose known, safe error codes to the client to avoid leaking internals
          const allowedCodes = new Set([
            "VALIDATION_ERROR",
            "INVALID_CREDENTIALS",
            "INACTIVE_ACCOUNT",
            "ORGANIZATION_NOT_FOUND",
            "LOGIN_FAILED",
          ]);
          const code = allowedCodes.has(err?.message) ? err.message : "LOGIN_FAILED";
          throw new Error(code);
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: SESSION_CONFIG.MAX_AGE,
    updateAge: SESSION_CONFIG.UPDATE_AGE,
  },

  jwt: {
    maxAge: SESSION_CONFIG.MAX_AGE,
  },

  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.organizationId = user.organizationId;
        token.organizationName = user.organizationName;
        token.onboardingCompleted = user.onboardingCompleted;
        token.status = user.status;
        token.permissions = user.permissions;
      }

      // Refresh user data from database when session is updated
      if (trigger === "update" && token.id) {
        try {
          await dbConnect();
          const user = await User.findById(token.id).populate(
            "organizationId",
            "name onboardingCompleted owner"
          );

          if (user) {
            token.role = user.role;
            token.organizationId = user.organizationId?._id?.toString() || null;
            token.organizationName = user.organizationId?.name || null;
            token.onboardingCompleted =
              user.organizationId?.onboardingCompleted || false;
            token.status = user.status;
            token.permissions = user.permissions || [];
          }
        } catch (error) {
          // Error refreshing user data
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session?.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.organizationId = token.organizationId;
        session.user.organizationName = token.organizationName;
        session.user.onboardingCompleted = token.onboardingCompleted;
        session.user.status = token.status;
        session.user.permissions = token.permissions;
      }
      return session;
    },
  },

  pages: {
    signIn: AUTH_ROUTES.LOGIN,
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  useSecureCookies: process.env.NODE_ENV === "production",

  cookies: {
    sessionToken: COOKIE_CONFIG.SESSION_TOKEN,
  },
};
