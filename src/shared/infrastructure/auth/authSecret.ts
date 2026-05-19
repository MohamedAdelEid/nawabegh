const DEVELOPMENT_AUTH_SECRET = "nawabegh-development-next-auth-secret";

export function getAuthSecret() {
  const secret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;
  if (secret) return secret;

  if (process.env.NODE_ENV !== "production") {
    return DEVELOPMENT_AUTH_SECRET;
  }

  return undefined;
}
