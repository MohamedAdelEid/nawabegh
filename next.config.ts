import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin(
  "./src/shared/infrastructure/config/i18n.ts",
);

const nextConfig: NextConfig = {
  images: { remotePatterns: [] },
};

export default withNextIntl(nextConfig);
