"use client";

import { signOut, useSession } from "next-auth/react";

export type AuthUser = {
  name: string;
  email: string;
  avatar?: string;
  role: string;
};

export function useAuth() {
  const { data: session, status } = useSession();

  const user: AuthUser | null = session?.user
    ? {
        name: session.user.name ?? "",
        email: session.user.email ?? "",
        avatar: session.user.image ?? undefined,
        role: session.user.role ?? "Student",
      }
    : null;

  return {
    user,
    isAuthenticated: Boolean(session),
    isLoading: status === "loading",
    logout: () => signOut({ callbackUrl: "/" }),
  };
}
