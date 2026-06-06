import { isValidPhoneNumber } from "react-phone-number-input";
import { z } from "zod";

const optionalPhone = z
  .string()
  .trim()
  .refine((value) => !value || isValidPhoneNumber(value), { message: "invalidPhone" });

const requiredPhone = z
  .string()
  .trim()
  .min(1, { message: "required" })
  .refine((value) => isValidPhoneNumber(value), { message: "invalidPhone" });

export const contactSchema = z.object({
  whatsApp: requiredPhone,
  alternativePhone: optionalPhone,
  parentPhone: requiredPhone,
  username: z
    .string()
    .trim()
    .min(3, { message: "usernameMin" })
    .max(30, { message: "usernameMax" })
    .regex(/^[a-zA-Z0-9._-]+$/, { message: "usernamePattern" }),
  address: z.string().trim().optional(),
});

export type ContactSchemaInput = z.infer<typeof contactSchema>;
