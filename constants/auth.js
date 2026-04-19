export const SESSION_CONFIG = {
  MAX_AGE: 24 * 60 * 60,
  UPDATE_AGE: 60 * 60,
  REFETCH_INTERVAL: 0,
  REFETCH_ON_WINDOW_FOCUS: false,
  REFETCH_WHEN_OFFLINE: false,
  REFETCH_ON_MOUNT: true,
};

export const COOKIE_CONFIG = {
  SESSION_TOKEN: {
    name: "next-auth.session-token",
    options: {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
    },
  },
};

export const REGISTRATION_TYPES = {
  USER: "user",
  SUPER_ADMIN: "super_admin",
  ORGANIZATION: "organization",
};
