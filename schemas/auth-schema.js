import { z } from "zod";

/**
 * Base password validation schema
 */
const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters");

/**
 * Password confirmation schema
 */
const passwordConfirmationSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

/**
 * Login schema
 */
export const loginSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
});

/**
 * Register schema
 */
export const registerSchema = z
  .object({
    name: z.string().min(1, "Name is required").trim(),
    email: z.string().email("Invalid email format").toLowerCase().trim(),
    organizationName: z.string().min(1, "Organization name is required").trim(),
    businessType: z.string().optional(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .merge(passwordConfirmationSchema);

/**
 * Forgot password schema
 */
export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase().trim(),
});

/**
 * Reset password schema
 */
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
  })
  .merge(passwordConfirmationSchema);

/**
 * Change password schema
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
  })
  .merge(passwordConfirmationSchema);

/**
 * Verify email schema
 */
export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

/**
 * Resend verification email schema
 */
export const resendVerificationSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase().trim(),
});

/**
 * Invite user schema
 */
export const inviteUserSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  name: z.string().min(1, "Name is required").trim(),
  email: z.string().email("Invalid email format").toLowerCase().trim(),
  role: z.enum(["admin", "staff"]),
  permissions: z.array(z.string()).optional(),
  message: z.string().trim().optional(),
});

/**
 * Accept invitation schema
 */
export const acceptInvitationSchema = z
  .object({
    token: z.string().min(1, "Invitation token is required"),
  })
  .merge(passwordConfirmationSchema);

/**
 * Refresh token schema
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

/**
 * Logout schema
 */
export const logoutSchema = z.object({
  refreshToken: z.string().optional(),
  allDevices: z.boolean().default(false),
});

/**
 * Change email schema
 */
export const changeEmailSchema = z.object({
  newEmail: z.string().email("Invalid email format").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});

/**
 * Two-factor authentication setup schema
 */
export const twoFactorSetupSchema = z.object({
  method: z.enum(["sms", "email", "app"]),
  phone: z.string().optional(), // Required for SMS method
});

/**
 * Two-factor authentication verify schema
 */
export const twoFactorVerifySchema = z.object({
  code: z.string().min(1, "Verification code is required"),
  method: z.enum(["sms", "email", "app"]),
});

/**
 * Two-factor authentication disable schema
 */
export const twoFactorDisableSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

/**
 * Session management schema
 */
export const sessionManagementSchema = z.object({
  sessionId: z.string().optional(),
  allSessions: z.boolean().default(false),
});

/**
 * Account deletion schema
 */
export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required"),
  confirmDeletion: z.boolean().refine((val) => val === true, {
    message: "You must confirm account deletion",
  }),
});

/**
 * OAuth login schema
 */
export const oAuthLoginSchema = z.object({
  provider: z.enum(["google", "facebook", "github"]),
  code: z.string().min(1, "Authorization code is required"),
  redirectUri: z.string().url("Invalid redirect URI"),
});

/**
 * OAuth callback schema
 */
export const oAuthCallbackSchema = z.object({
  code: z.string().min(1, "Authorization code is required"),
  state: z.string().optional(),
});

/**
 * Password strength check schema
 */
export const passwordStrengthSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

/**
 * Password strength response schema
 */
export const passwordStrengthResponseSchema = z.object({
  score: z.number().min(0).max(4),
  feedback: z.array(z.string()),
  suggestions: z.array(z.string()),
});

/**
 * Account lockout schema
 */
export const accountLockoutSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase().trim(),
  reason: z.enum(["suspicious_activity", "multiple_failures", "admin_action"]),
  duration: z.number().min(1).default(30), // minutes
});

/**
 * Account unlock schema
 */
export const accountUnlockSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase().trim(),
  token: z.string().min(1, "Unlock token is required"),
});
