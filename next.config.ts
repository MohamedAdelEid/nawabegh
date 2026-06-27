import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin(
  "./src/shared/infrastructure/config/i18n.ts",
);

function imageRemotePatterns(): NonNullable<NextConfig["images"]>["remotePatterns"] {
  const candidates = [
    process.env.NEXT_PUBLIC_FILE_PUBLIC_BASE_URL,
    process.env.NEXT_PUBLIC_API_URL,
    "https://nawabeghsystem.runasp.net",
  ];

  const seen = new Set<string>();

  return candidates.flatMap((raw) => {
    if (!raw) return [];

    try {
      const { protocol, hostname } = new URL(raw);
      if (!hostname || seen.has(hostname)) return [];

      seen.add(hostname);
      return [
        {
          protocol: protocol.replace(":", "") as "http" | "https",
          hostname,
          pathname: "/**",
        },
      ];
    } catch {
      return [];
    }
  });
}

const nextConfig: NextConfig = {
  images: { remotePatterns: imageRemotePatterns() },
  async redirects() {
    return [
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
