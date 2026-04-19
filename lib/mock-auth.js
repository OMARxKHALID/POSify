"use client";

import React, { createContext, useContext, useMemo } from "react";

const SessionContext = createContext({
  data: null,
  status: "unauthenticated",
  update: async () => null,
});

export function SessionProvider({ children }) {
  const session = useMemo(() => ({
    user: {
      id: "demo-admin-id",
      name: "Demo Admin",
      email: "admin@posify.com",
      role: "super_admin",
      status: "active",
      permissions: [],
      image: null,
      organizationId: "demo-org-id",
      lastLogin: new Date().toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    },
    expires: "9999-12-31T23:59:59.999Z",
  }), []);

  const value = {
    data: session,
    status: "authenticated",
    update: async () => session,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}

export function signIn() {
  console.log("[MOCK AUTH] signIn called");
  window.location.href = "/admin/dashboard";
}

export function signOut() {
  console.log("[MOCK AUTH] signOut called");
  window.location.href = "/admin/login";
}

export function getSession() {
  return Promise.resolve({
    user: {
      id: "demo-admin-id",
      name: "Demo Admin",
      email: "admin@posify.com",
      role: "super_admin",
    },
    expires: "9999-12-31T23:59:59.999Z",
  });
}
