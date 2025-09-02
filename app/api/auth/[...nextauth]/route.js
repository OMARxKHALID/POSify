import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { loginSchema } from "@/schemas/auth-schema.js";
import { User } from "@/models/user.js";
import dbConnect from "@/lib/db.js";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember Me", type: "boolean" },
      },
      async authorize(credentials) {
        try {
          await dbConnect(); // Connect to database

          // Validate credentials using schema
          const validationResult = loginSchema.safeParse(credentials);
          if (!validationResult.success) {
            console.error(
              "Login validation failed:",
              validationResult.error.errors
            );
            return null;
          }

          const { email, password } = validationResult.data;

          // Find user by email with organization details
          const user = await User.findOne({
            email: email.toLowerCase(),
          }).populate("organizationId", "name slug status");
          if (!user) {
            console.error("User not found:", email);
            return null;
          }

          // Check if user is active
          if (user.status !== "active") {
            console.error("User not active:", email, user.status);
            return null;
          }

          // Verify password
          const isValidPassword = await user.comparePassword(password);
          if (!isValidPassword) {
            console.error("Invalid password for user:", email);
            return null;
          }

          // Update last login timestamp
          user.lastLogin = new Date();
          await user.save();

          // Return user object for session
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            organizationId: user.organizationId?._id?.toString(),
            organizationName: user.organizationId?.name,
            organizationSlug: user.organizationId?.slug,
            organizationStatus: user.organizationId?.status,
            status: user.status,
            permissions: user.permissions,
            emailVerified: user.emailVerified,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Add user data to JWT token
        token.role = user.role;
        token.organizationId = user.organizationId;
        token.organizationName = user.organizationName;
        token.organizationSlug = user.organizationSlug;
        token.organizationStatus = user.organizationStatus;
        token.status = user.status;
        token.permissions = user.permissions;
        token.emailVerified = user.emailVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        // Add token data to session
        session.user.id = token.sub;
        session.user.role = token.role;
        session.user.organizationId = token.organizationId;
        session.user.organizationName = token.organizationName;
        session.user.organizationSlug = token.organizationSlug;
        session.user.organizationStatus = token.organizationStatus;
        session.user.status = token.status;
        session.user.permissions = token.permissions;
        session.user.emailVerified = token.emailVerified;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Redirect super admin to admin dashboard
      if (url.startsWith(baseUrl)) return url;
      // Redirect to dashboard after login
      return `${baseUrl}/dashboard`;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
});

export { handler as GET, handler as POST };
