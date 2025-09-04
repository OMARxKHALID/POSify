import CredentialsProvider from "next-auth/providers/credentials";
import { loginSchema } from "@/schemas/auth-schema.js";
import { User } from "@/models/user.js";
import { apiError, apiFromZod } from "@/lib/api-utils/index.js";
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
        try {
          await dbConnect();

          const parsed = loginSchema.safeParse(credentials);
          if (!parsed.success) {
            throw new Error(JSON.stringify(apiFromZod(parsed.error)));
          }

          const { email, password } = parsed.data;
          const user = await User.findOne({
            email: email.toLowerCase(),
          }).populate("organizationId", "name slug status");

          if (!user) {
            throw new Error(
              JSON.stringify(
                apiError("Invalid credentials", "INVALID_CREDENTIALS", [], 401)
              )
            );
          }

          if (user.status !== "active") {
            throw new Error(
              JSON.stringify(
                apiError("Account inactive", "INACTIVE_ACCOUNT", [], 403)
              )
            );
          }

          const valid = await user.comparePassword(password);
          if (!valid) {
            throw new Error(
              JSON.stringify(
                apiError("Invalid credentials", "INVALID_CREDENTIALS", [], 401)
              )
            );
          }

          user.lastLogin = new Date();
          await user.save();

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

          return safeUser;
        } catch (err) {
          if (err.message?.startsWith("{")) {
            throw err;
          }
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
      if (user) {
        token.id = user.id; // NextAuth standard
        token._id = user._id; // Your custom field
        token.role = user.role;
        token.organizationId = user.organizationId;
        token.status = user.status;
        token.permissions = user.permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id; // NextAuth standard
        session.user._id = token._id; // Your custom field
        session.user.role = token.role;
        session.user.organizationId = token.organizationId;
        session.user.status = token.status;
        session.user.permissions = token.permissions;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // If URL is relative, make it absolute
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // If URL is on the same origin, allow it
      if (url.startsWith(baseUrl)) return url;
      // For testing purposes, stay on test-routes page
      return `${baseUrl}/test-routes`;
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
