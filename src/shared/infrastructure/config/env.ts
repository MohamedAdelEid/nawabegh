import { z } from "zod";

/**
 * Client-consumable environment values only.
 * Server-only auth secrets stay in their feature modules to avoid
 * crashing client bundles when local env vars are not configured yet.
 */
const schema = z.object({
  NEXT_PUBLIC_API_URL: z
    .string()
    .url()
    .default("https://api.nwabigh.com"),
  NEXT_PUBLIC_API_VERSION_PREFIX: z.string().default("/api/v1"),
  NEXT_PUBLIC_FILE_PUBLIC_BASE_URL: z
    .string()
    .url()
    .default("https://api.nwabigh.com"),
  NEXT_PUBLIC_API_TIMEOUT: z.string().default("15000"),
});

export const env = schema.parse(process.env);
