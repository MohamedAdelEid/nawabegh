import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin(
  "./src/shared/infrastructure/config/i18n.ts",
);

const nextConfig: NextConfig = {
  images: { remotePatterns: [] },
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
