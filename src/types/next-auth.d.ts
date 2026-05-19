import type { DefaultSession } from "next-auth";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpiresAt?: string;
    error?: "RefreshAccessTokenError";
    user?: DefaultSession["user"] & {
      id?: string;
      domainUid?: string | null;
      role?: string;
    };
  }

  interface User {
    id?: string;
    domainUid?: string | null;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpiresAt?: string;
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpiresAt?: string;
    userId?: string;
    domainUid?: string | null;
    role?: string;
    picture?: string | null;
    error?: "RefreshAccessTokenError";
  }
}
