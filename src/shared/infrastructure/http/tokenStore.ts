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

export function getRequestLanguage(): string {
  if (typeof window === "undefined") {
    return "ar";
  }

  try {
    const fromStorage = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isAppLocale(fromStorage)) {
      return fromStorage;
    }
  } catch {
  }

  const fromDocument = document.documentElement.lang;
  return isAppLocale(fromDocument) ? fromDocument : "ar";
}
