import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin(
  "./src/shared/infrastructure/config/i18n.ts",
);

function buildFileRemotePatterns(): NonNullable<NextConfig["images"]>["remotePatterns"] {
  const bases = [
    process.env.NEXT_PUBLIC_FILE_PUBLIC_BASE_URL,
    process.env.NEXT_PUBLIC_API_URL,
    "https://nawabeghsystem.runasp.net",
  ].filter((value): value is string => Boolean(value?.trim()));

  const patterns = bases
    .map((base) => {
      try {
        const url = new URL(base);
        return {
          protocol: url.protocol.replace(":", "") as "http" | "https",
          hostname: url.hostname,
          pathname: "/**",
        };
      } catch {
        return null;
      }
    })
    .filter((pattern): pattern is NonNullable<typeof pattern> => pattern !== null);

  const seen = new Set<string>();
  return patterns.filter((pattern) => {
    const key = `${pattern.protocol}://${pattern.hostname}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: buildFileRemotePatterns(),
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async redirects() {
    return [
      { source: "/", destination: "/auth/register", permanent: false },
      { source: "/login", destination: "/auth/login", permanent: false },
      { source: "/register", destination: "/auth/register", permanent: false },
      { source: "/register/study", destination: "/auth/register", permanent: false },
      { source: "/register/contact", destination: "/auth/register", permanent: false },
      { source: "/auth/register/study", destination: "/auth/register", permanent: false },
      { source: "/auth/register/contact", destination: "/auth/register", permanent: false },
      { source: "/register/verify", destination: "/auth/register/verify", permanent: false },
      { source: "/register/success", destination: "/auth/register/success", permanent: false },
    ];
  },
};

export default withNextIntl(nextConfig);
