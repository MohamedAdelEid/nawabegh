import { NextResponse } from "next/server";
import { getAuthErrorMessage, mapLoginResponseToSession } from "@/modules/auth/infrastructure/authSession";
import { loginWithGoogle } from "@/modules/auth/infrastructure/loginApi";
import type { GoogleAuthRole } from "@/modules/auth/domain/types/login.types";
import { resolveApiErrorMessage } from "@/shared/infrastructure/api/apiErrorMessage.utils";
import {
  describeGoogleTokenIssue,
  peekGoogleIdToken,
} from "@/modules/auth/domain/utils/googleIdToken.utils";
import { env } from "@/shared/infrastructure/config/env";

export const runtime = "nodejs";

type GoogleLoginBody = {
  idToken?: string;
  role?: string;
  locale?: string;
};

const ALLOWED_ROLES: GoogleAuthRole[] = ["Student", "Parent", "Teacher"];

function isGoogleRole(value: string): value is GoogleAuthRole {
  return ALLOWED_ROLES.includes(value as GoogleAuthRole);
}

/**
 * Exchanges a Google ID token with the backend, then returns session fields
 * for establishing a NextAuth session via the `registration-otp` provider.
 */
export async function POST(request: Request) {
  let body: GoogleLoginBody;
  try {
    body = (await request.json()) as GoogleLoginBody;
  } catch {
    return NextResponse.json({ ok: false, message: "طلب غير صالح." }, { status: 400 });
  }

  const idToken = body.idToken?.trim() ?? "";
  const role = body.role?.trim() ?? "";
  const locale = body.locale === "en" ? "en" : "ar";

  if (!idToken) {
    return NextResponse.json(
      { ok: false, message: "لم يتم استلام رمز Google. حاول مرة أخرى." },
      { status: 400 },
    );
  }

  if (!isGoogleRole(role)) {
    return NextResponse.json(
      {
        ok: false,
        message: "تسجيل الدخول عبر Google متاح للطلاب وأولياء الأمور والمعلمين فقط.",
      },
      { status: 400 },
    );
  }

  const peek = peekGoogleIdToken(idToken);
  const localIssue = describeGoogleTokenIssue(peek, locale);
  // Fail fast only for clearly broken / expired tokens (not audience — backend is source of truth).
  if (peek?.isExpired || !peek) {
    return NextResponse.json(
      { ok: false, message: localIssue ?? "رمز Google غير صالح أو منتهي الصلاحية" },
      { status: 400 },
    );
  }

  try {
    const response = await loginWithGoogle({ idToken, role }, locale);

    if (response.isSuccess === false || response.hasValue === false) {
      const apiMessage = resolveApiErrorMessage(response, getAuthErrorMessage(response));
      const message =
        /رمز Google|invalid|expired|غير صالح|منتهي/i.test(apiMessage) && localIssue
          ? localIssue
          : apiMessage;

      return NextResponse.json(
        {
          ok: false,
          message,
          debug:
            process.env.NODE_ENV === "development"
              ? {
                  tokenAud: peek.aud ?? null,
                  tokenAzp: peek.azp ?? null,
                  expectedClientId: env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
                  audienceMatchesClient: peek.audienceMatchesClient,
                  apiBaseUrl: env.NEXT_PUBLIC_API_URL,
                }
              : undefined,
        },
        { status: 400 },
      );
    }

    const sessionPayload = mapLoginResponseToSession(response);
    if (!sessionPayload) {
      const message = resolveApiErrorMessage(response, getAuthErrorMessage(response));
      return NextResponse.json({ ok: false, message }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      session: {
        accessToken: sessionPayload.accessToken,
        refreshToken: sessionPayload.refreshToken ?? "",
        accessTokenExpiresAt: sessionPayload.accessTokenExpiresAt,
        userId: sessionPayload.user.id,
        userName: sessionPayload.user.name,
        email: sessionPayload.user.email,
        role: sessionPayload.user.role,
        avatar: sessionPayload.user.avatar ?? "",
        domainUid: sessionPayload.user.domainUid ?? "",
        requiresProfileCompletion: Boolean(sessionPayload.user.requiresProfileCompletion),
      },
    });
  } catch (error) {
    const message = resolveApiErrorMessage(
      error instanceof Error ? { message: error.message } : null,
      "تعذر تسجيل الدخول عبر جوجل. حاول مرة أخرى.",
    );
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
