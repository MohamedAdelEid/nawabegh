import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { AUTH_ROUTES } from "@/modules/auth/config/routes";
import {
  decodeAuthTokenClaims,
  getAuthErrorMessage,
  mapConfirmOtpResponseToSession,
  mapLoginResponseToSession,
  mapRefreshResponseToTokens,
} from "@/modules/auth/infrastructure/authSession";
import { loginWithCredentials, refreshAuthToken } from "@/modules/auth/infrastructure/loginApi";
import { getAuthSecret } from "./authSecret";

const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;
const TOKEN_REFRESH_SKEW_MS = 60 * 1000;

function getTokenExpiryMs(token: JWT) {
  if (token.accessTokenExpiresAt) {
    const expiresAt = Date.parse(token.accessTokenExpiresAt);
    if (Number.isFinite(expiresAt)) return expiresAt;
  }

  if (token.accessToken) {
    const claims = decodeAuthTokenClaims(token.accessToken);
    if (typeof claims.exp === "number") return claims.exp * 1000;
  }

  return null;
}

async function refreshJwtToken(token: JWT): Promise<JWT> {
  if (!token.accessToken || !token.refreshToken) {
    return { ...token, error: "RefreshAccessTokenError" };
  }

  try {
    const response = await refreshAuthToken(token.accessToken, token.refreshToken);
    const payload = mapRefreshResponseToTokens(response, token.refreshToken);
    if (!payload) throw new Error(getAuthErrorMessage(response));

    return {
      ...token,
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken ?? token.refreshToken,
      accessTokenExpiresAt: payload.accessTokenExpiresAt || token.accessTokenExpiresAt,
      error: undefined,
    };
  } catch {
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: AUTH_ROUTES.LOGIN,
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        locale: { label: "Locale", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim();
        const password = credentials?.password;
        const locale = credentials?.locale === "en" ? "en" : "ar";

        if (!email || !password) {
          throw new Error("Missing email or password.");
        }

        const response = await loginWithCredentials(
          {
            email,
            password,
          },
          locale,
        );

        const sessionPayload = mapLoginResponseToSession(response);
        if (sessionPayload == null) {
          throw new Error(getAuthErrorMessage(response));
        }

        return {
          id: sessionPayload.user.id,
          name: sessionPayload.user.name,
          email: sessionPayload.user.email,
          image: sessionPayload.user.avatar ?? undefined,
          role: sessionPayload.user.role,
          domainUid: sessionPayload.user.domainUid,
          accessToken: sessionPayload.accessToken,
          refreshToken: sessionPayload.refreshToken,
          accessTokenExpiresAt: sessionPayload.accessTokenExpiresAt,
        };
      },
    }),
    CredentialsProvider({
      id: "registration-otp",
      name: "Registration OTP",
      credentials: {
        accessToken: { type: "text" },
        refreshToken: { type: "text" },
        accessTokenExpiresAt: { type: "text" },
        userId: { type: "text" },
        userName: { type: "text" },
        email: { type: "text" },
        role: { type: "text" },
        avatar: { type: "text" },
        domainUid: { type: "text" },
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new Error("Missing OTP session credentials.");
        }

        const accessToken = credentials.accessToken?.trim();
        const userId = credentials.userId?.trim();
        const email = credentials.email?.trim();

        if (!accessToken || !userId || !email) {
          throw new Error("Missing OTP session credentials.");
        }

        const sessionPayload = mapConfirmOtpResponseToSession({
          token: accessToken,
          refreshToken: credentials.refreshToken ?? null,
          expiresAt: credentials.accessTokenExpiresAt ?? "",
          user: {
            id: userId,
            fullName: credentials.userName ?? "User",
            email,
            photo: credentials.avatar || null,
            roles: credentials.role ? [credentials.role] : ["Student"],
          },
        });

        if (!sessionPayload) {
          throw new Error("Unable to establish session after verification.");
        }

        return {
          id: sessionPayload.user.id,
          name: sessionPayload.user.name,
          email: sessionPayload.user.email,
          image: sessionPayload.user.avatar ?? undefined,
          role: sessionPayload.user.role,
          domainUid: sessionPayload.user.domainUid,
          accessToken: sessionPayload.accessToken,
          refreshToken: sessionPayload.refreshToken,
          accessTokenExpiresAt: sessionPayload.accessTokenExpiresAt,
        };
      },
    }),
  ],
  secret: getAuthSecret(),
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE_SECONDS,
  },
  jwt: {
    maxAge: SESSION_MAX_AGE_SECONDS,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.accessTokenExpiresAt = user.accessTokenExpiresAt;
        token.userId = user.id;
        token.domainUid = user.domainUid;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image ?? null;
        token.error = undefined;
      }

      const expiresAt = getTokenExpiryMs(token);
      if (expiresAt && Date.now() < expiresAt - TOKEN_REFRESH_SKEW_MS) {
        return token;
      }

      if (!user) {
        return refreshJwtToken(token);
      }

      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.accessTokenExpiresAt = token.accessTokenExpiresAt;
      session.user = {
        ...session.user,
        id: token.userId,
        domainUid: token.domainUid,
        name: token.name ?? session.user?.name ?? "",
        email: token.email ?? session.user?.email ?? "",
        image: token.picture ?? session.user?.image ?? null,
        role: token.role,
      };
      session.error = token.error;

      return session;
    },
  },
};

export async function auth() {
  try {
    return await getServerSession(authOptions);
  } catch {
    return null;
  }
}
