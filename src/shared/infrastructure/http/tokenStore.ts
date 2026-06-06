import { getSession } from "next-auth/react";
import { auth } from "@/shared/infrastructure/auth/nextAuth";
import { LOCALE_STORAGE_KEY, isAppLocale } from "@/config/locale";

export async function getToken(): Promise<string | null> {
  if (typeof window === "undefined") {
    const session = await auth();
    return session?.accessToken ?? null;
  }
  const session = await getSession();
  return session?.accessToken ?? null;
}

export async function getRequestLanguage(): Promise<string> {
  if (typeof window !== "undefined") {
    try {
      const fromStorage = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (isAppLocale(fromStorage)) return fromStorage;
    } catch {
    }

    const fromDocument = document.documentElement.lang;
    return isAppLocale(fromDocument) ? fromDocument : "ar";
  }

  const { cookies } = await import("next/headers");
  const fromCookie = (await cookies()).get("NEXT_LOCALE")?.value ?? null;
  return isAppLocale(fromCookie) ? fromCookie : "ar";
}
