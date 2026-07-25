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
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: z
    .string()
    .min(1)
    .default(
      "1089222314346-a8mc4fs5u0urid9tbvb3gqekkojk4unj.apps.googleusercontent.com",
    ),
});

export const env = schema.parse(process.env);
