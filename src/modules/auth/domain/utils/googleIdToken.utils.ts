import { env } from "@/shared/infrastructure/config/env";

export type GoogleIdTokenPeek = {
  aud?: string;
  azp?: string;
  exp?: number;
  iss?: string;
  email?: string;
  isExpired: boolean;
  audienceMatchesClient: boolean;
};

function decodeBase64UrlJson(value: string): Record<string, unknown> | null {
  try {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padding = normalized.length % 4;
    const padded =
      padding === 0 ? normalized : normalized.padEnd(normalized.length + (4 - padding), "=");
    const json = Buffer.from(padded, "base64").toString("utf-8");
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Read Google ID token claims without verifying the signature (diagnostics only). */
export function peekGoogleIdToken(idToken: string): GoogleIdTokenPeek | null {
  const parts = idToken.split(".");
  if (parts.length < 2 || !parts[1]) return null;

  const payload = decodeBase64UrlJson(parts[1]);
  if (!payload) return null;

  const aud = typeof payload.aud === "string" ? payload.aud : undefined;
  const azp = typeof payload.azp === "string" ? payload.azp : undefined;
  const iss = typeof payload.iss === "string" ? payload.iss : undefined;
  const email = typeof payload.email === "string" ? payload.email : undefined;
  const exp = typeof payload.exp === "number" ? payload.exp : undefined;
  const expected = env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const nowSec = Math.floor(Date.now() / 1000);

  return {
    aud,
    azp,
    exp,
    iss,
    email,
    isExpired: typeof exp === "number" ? exp < nowSec - 60 : false,
    audienceMatchesClient: Boolean(
      expected && (aud === expected || azp === expected),
    ),
  };
}

export function describeGoogleTokenIssue(peek: GoogleIdTokenPeek | null, locale: "ar" | "en"): string | null {
  if (!peek) {
    return locale === "ar"
      ? "رمز Google غير مكتمل أو تالف. أعد المحاولة."
      : "Google token is malformed. Please try again.";
  }

  if (peek.isExpired) {
    return locale === "ar"
      ? "رمز Google منتهي الصلاحية. أعد تسجيل الدخول عبر جوجل."
      : "Google token expired. Please sign in with Google again.";
  }

  if (!peek.audienceMatchesClient) {
    return locale === "ar"
      ? "إعدادات Google غير متطابقة بين الواجهة والخادم (Client ID). يجب أن يستخدم الـ Backend نفس Client ID المستخدم في الويب."
      : "Google Client ID mismatch between frontend and backend. Backend must use the same web Client ID.";
  }

  return null;
}
