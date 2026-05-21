import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { getAuthSecret } from "@/shared/infrastructure/auth/authSecret";
import { ROUTES } from "@/shared/infrastructure/config/routes";

const PROTECTED_PREFIXES = ["/admin", "/student", "/teacher", "/parent"];
const AUTH_COOKIE_NAMES = [
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
  "next-auth.callback-url",
  "__Secure-next-auth.callback-url",
  "next-auth.csrf-token",
  "__Host-next-auth.csrf-token",
];

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function getRoleHome(role?: string | null) {
  const normalizedRole = role?.trim().toLowerCase();
  if (normalizedRole === "admin") return ROUTES.ADMIN.HOME;
  if (normalizedRole === "teacher") return ROUTES.USER.TEACHER.HOME;
  if (normalizedRole === "parent") return ROUTES.USER.PARENT.HOME;
  return ROUTES.USER.STUDENT.HOME;
}

function clearAuthCookies(response: NextResponse) {
  for (const cookieName of AUTH_COOKIE_NAMES) {
    response.cookies.delete(cookieName);
  }
  return response;
}

async function readAuthToken(request: NextRequest) {
  try {
    return await getToken({
      req: request,
      ...(getAuthSecret() ? { secret: getAuthSecret() } : {}),
    });
  } catch {
    return undefined;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = await readAuthToken(request);

  if (pathname === ROUTES.AUTH.LOGIN && token) {
    return NextResponse.redirect(new URL(getRoleHome(token.role), request.url));
  }

  if (isProtectedPath(pathname) && !token) {
    const loginUrl = new URL(ROUTES.AUTH.LOGIN, request.url);
    loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
    const response = NextResponse.redirect(loginUrl);
    return token === undefined ? clearAuthCookies(response) : response;
  }

  if (token === undefined) {
    return clearAuthCookies(NextResponse.next());
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/admin/:path*", "/student/:path*", "/teacher/:path*", "/parent/:path*"],
};
