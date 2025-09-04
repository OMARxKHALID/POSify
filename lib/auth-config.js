import CredentialsProvider from "next-auth/providers/credentials";
import { loginSchema } from "@/schemas/auth-schema.js";
import { User } from "@/models/user.js";
import { apiError, apiSuccess, apiFromZod } from "@/lib/api";
import dbConnect from "./db.js";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("🔍 [DEBUG] NextAuth authorize called with credentials:", {
          email: credentials?.email,
          hasPassword: !!credentials?.password,
          passwordLength: credentials?.password?.length || 0,
        });

        try {
          console.log("🔍 [DEBUG] Connecting to database...");
          await dbConnect();
          console.log("✅ [DEBUG] Database connected successfully");

          console.log("🔍 [DEBUG] Validating credentials with schema...");
          const parsed = loginSchema.safeParse(credentials);
          if (!parsed.success) {
            console.log(
              "❌ [DEBUG] Credential validation failed:",
              parsed.error
            );
            throw new Error(JSON.stringify(apiFromZod(parsed.error)));
          }
          console.log("✅ [DEBUG] Credentials validated successfully");

          const { email, password } = parsed.data;
          console.log("🔍 [DEBUG] Looking up user in database:", {
            email: email.toLowerCase(),
          });

          const user = await User.findOne({
            email: email.toLowerCase(),
          }).populate("organizationId", "name slug status");

          console.log("🔍 [DEBUG] User lookup result:", {
            found: !!user,
            userId: user?._id,
            email: user?.email,
            name: user?.name,
            role: user?.role,
            status: user?.status,
            organizationId: user?.organizationId?._id,
            organizationName: user?.organizationId?.name,
            organizationStatus: user?.organizationId?.status,
            emailVerified: user?.emailVerified,
            permissions: user?.permissions,
          });

          if (!user) {
            console.log("❌ [DEBUG] User not found in database");
            throw new Error(
              JSON.stringify(
                apiError("Invalid credentials", "INVALID_CREDENTIALS", [], 401)
              )
            );
          }

          if (user.status !== "active") {
            console.log("❌ [DEBUG] User account is not active:", user.status);
            throw new Error(
              JSON.stringify(
                apiError("Account inactive", "INACTIVE_ACCOUNT", [], 403)
              )
            );
          }
          console.log("✅ [DEBUG] User account is active");

          console.log("🔍 [DEBUG] Comparing password...");
          const valid = await user.comparePassword(password);
          if (!valid) {
            console.log("❌ [DEBUG] Password comparison failed");
            throw new Error(
              JSON.stringify(
                apiError("Invalid credentials", "INVALID_CREDENTIALS", [], 401)
              )
            );
          }
          console.log("✅ [DEBUG] Password comparison successful");

          console.log("🔍 [DEBUG] Updating user lastLogin timestamp...");
          user.lastLogin = new Date();
          await user.save();
          console.log("✅ [DEBUG] User lastLogin updated successfully");

          console.log("🔍 [DEBUG] Creating safe user object for NextAuth...");
          const safeUser = {
            id: user._id.toString(), // NextAuth requires 'id' field
            _id: user._id.toString(), // Your custom _id field
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status,
            organizationId: user.organizationId?._id?.toString() || null,
            permissions: user.permissions,
          };

          console.log("🔍 [DEBUG] Safe user object created:", {
            id: safeUser.id,
            _id: safeUser._id,
            email: safeUser.email,
            name: safeUser.name,
            role: safeUser.role,
            status: safeUser.status,
            organizationId: safeUser.organizationId,
            permissions: safeUser.permissions,
          });

          console.log("✅ [DEBUG] Returning safe user object to NextAuth");
          return safeUser;
        } catch (err) {
          console.log("❌ [DEBUG] NextAuth authorize error:", {
            message: err.message,
            stack: err.stack,
            name: err.name,
            isJsonError: err.message?.startsWith("{"),
          });

          if (err.message?.startsWith("{")) {
            console.log(
              "❌ [DEBUG] Re-throwing JSON error (validation/auth error)"
            );
            throw err;
          }

          console.log("❌ [DEBUG] Wrapping generic error in API error format");
          throw new Error(
            JSON.stringify(apiError("Auth failed", "AUTH_ERROR", [], 500))
          );
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
    updateAge: 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      console.log("🔍 [DEBUG] JWT callback called:", {
        hasUser: !!user,
        hasToken: !!token,
        userData: user
          ? {
              id: user.id,
              _id: user._id,
              email: user.email,
              role: user.role,
              organizationId: user.organizationId,
            }
          : null,
        tokenData: token
          ? {
              id: token.id,
              _id: token._id,
              email: token.email,
              role: token.role,
              organizationId: token.organizationId,
            }
          : null,
      });

      if (user) {
        console.log("🔍 [DEBUG] Setting token data from user object");
        token.id = user.id; // NextAuth standard
        token._id = user._id; // Your custom field
        token.role = user.role;
        token.organizationId = user.organizationId;
        token.status = user.status;
        token.permissions = user.permissions;
        console.log("✅ [DEBUG] Token data set successfully");
      } else {
        console.log("🔍 [DEBUG] No user data, using existing token");
      }

      console.log("🔍 [DEBUG] Final token data:", {
        id: token.id,
        _id: token._id,
        email: token.email,
        role: token.role,
        organizationId: token.organizationId,
        status: token.status,
        permissions: token.permissions,
      });

      return token;
    },
    async session({ session, token }) {
      console.log("🔍 [DEBUG] Session callback called:", {
        hasSession: !!session,
        hasToken: !!token,
        sessionUser: session?.user
          ? {
              id: session.user.id,
              email: session.user.email,
              name: session.user.name,
            }
          : null,
        tokenData: token
          ? {
              id: token.id,
              _id: token._id,
              email: token.email,
              role: token.role,
              organizationId: token.organizationId,
            }
          : null,
      });

      if (token) {
        console.log("🔍 [DEBUG] Setting session data from token");
        session.user.id = token.id; // NextAuth standard
        session.user._id = token._id; // Your custom field
        session.user.role = token.role;
        session.user.organizationId = token.organizationId;
        session.user.status = token.status;
        session.user.permissions = token.permissions;
        console.log("✅ [DEBUG] Session data set successfully");
      } else {
        console.log("🔍 [DEBUG] No token data available");
      }

      console.log("🔍 [DEBUG] Final session data:", {
        userId: session.user?.id,
        userEmail: session.user?.email,
        userName: session.user?.name,
        userRole: session.user?.role,
        userStatus: session.user?.status,
        userOrganizationId: session.user?.organizationId,
        userPermissions: session.user?.permissions,
      });

      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log("🔍 [DEBUG] Redirect callback called:", {
        url,
        baseUrl,
        isRelative: url?.startsWith("/"),
        isSameOrigin: url?.startsWith(baseUrl),
      });

      // If URL is relative, make it absolute
      if (url.startsWith("/")) {
        const redirectUrl = `${baseUrl}${url}`;
        console.log(
          "🔍 [DEBUG] Relative URL detected, redirecting to:",
          redirectUrl
        );
        return redirectUrl;
      }

      // If URL is on the same origin, allow it
      if (url.startsWith(baseUrl)) {
        console.log(
          "🔍 [DEBUG] Same origin URL detected, redirecting to:",
          url
        );
        return url;
      }

      // For testing purposes, stay on test-routes page
      const defaultRedirect = `${baseUrl}/test-routes`;
      console.log(
        "🔍 [DEBUG] Default redirect to test-routes:",
        defaultRedirect
      );
      return defaultRedirect;
    },
  },
  pages: {
    signIn: "/test-routes",
    error: "/test-routes",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  useSecureCookies: process.env.NODE_ENV === "production",
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
};
