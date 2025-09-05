import CredentialsProvider from "next-auth/providers/credentials";
import { loginSchema } from "@/schemas/auth-schema.js";
import { User } from "@/models/user.js";
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
            throw new Error("VALIDATION_ERROR");
          }

          const { email, password } = parsed.data;

          const user = await User.findOne({
            email: email.toLowerCase(),
          }).populate("organizationId", "name slug status");

          if (!user) {
            throw new Error("INVALID_CREDENTIALS");
          }

          if (user.status !== "active") {
            throw new Error("INACTIVE_ACCOUNT");
          }

          const isValid = await user.comparePassword(password);
          if (!isValid) {
            throw new Error("INVALID_CREDENTIALS");
          }

          user.lastLogin = new Date();
          await user
            .save()
            .catch((err) => console.error("Failed to update lastLogin:", err));

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status,
            organizationId: user.organizationId?._id?.toString() || null,
            permissions: user.permissions || [],
          };
        } catch (err) {
          console.error("Login error:", err.message);
          throw new Error(err.message || "LOGIN_FAILED");
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1 day
    updateAge: 60 * 60, // refresh every 1h
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.organizationId = user.organizationId;
        token.status = user.status;
        token.permissions = user.permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.organizationId = token.organizationId;
        session.user.status = token.status;
        session.user.permissions = token.permissions;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Simple and secure redirect logic
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
  },

  pages: {
    signIn: "/admin/login",
    error: "/admin/login?error=true",
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
