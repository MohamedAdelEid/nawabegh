import { z } from "zod";

const schema = z.object({
  NEXT_PUBLIC_API_URL:     z.string().url(),
  NEXT_PUBLIC_API_TIMEOUT: z.string().optional(),
  NEXTAUTH_SECRET:         z.string().min(1),
  NEXTAUTH_URL:            z.string().url(),
});

export const env = schema.parse(process.env);
