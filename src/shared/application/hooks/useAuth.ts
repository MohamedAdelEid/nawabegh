"use client";

import { useCallback, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { useLocale } from "next-intl";
import { logoutFromBackend } from "@/modules/auth/infrastructure/loginApi";
import { TEACHER_MOCK_PROFILE } from "@/modules/teacher/domain/data/teacherMockProfile";

export type AuthUser = {
  name: string;
  email: string;
  avatar?: string;
  role: string;
};

export function useAuth() {
  const { data: session, status } = useSession();
  const locale = useLocale() === "en" ? "en" : "ar";

  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") {
      void signOut({ callbackUrl: "/" });
    }
  }, [session?.error]);

  const logout = useCallback(async () => {
    try {
      await logoutFromBackend(session?.accessToken, session?.refreshToken, locale);
    } catch {
      // The local session must still be cleared if the backend logout request fails.
    } finally {
      await signOut({ callbackUrl: "/" });
    }
  }, [locale, session?.accessToken, session?.refreshToken]);

  const user: AuthUser | null = session?.user
    ? {
        name: session.user.name ?? "",
        email: session.user.email ?? "",
        avatar: session.user.image ?? undefined,
        role: session.user.role ?? "Student",
      }
    : null;

  if (user?.role === "Teacher") {
    if (!user.name) user.name = TEACHER_MOCK_PROFILE.name;
    if (!user.email) user.email = TEACHER_MOCK_PROFILE.email;
  }

  return {
    user,
    isAuthenticated: Boolean(session),
    isLoading: status === "loading",
    logout,
  };
}
