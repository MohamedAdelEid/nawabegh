"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LOCALE_STORAGE_KEY,
  isAppLocale,
} from "@/config/locale";

const NEXT_LOCALE_COOKIE = "NEXT_LOCALE";

export function LocaleFromStorage() {
  const router = useRouter();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (!isAppLocale(stored)) return;

      const match = document.cookie.match(
        new RegExp(`(?:^|; )${NEXT_LOCALE_COOKIE}=([^;]*)`),
      );
      const currentCookie = match?.[1] ? decodeURIComponent(match[1]) : null;
      if (currentCookie === stored) return;

      document.cookie = `${NEXT_LOCALE_COOKIE}=${stored}; path=/; max-age=31536000; SameSite=Lax`;
      router.refresh();
    } catch {
    }
  }, [router]);

  return null;
}
