import { z } from "zod";
import { isPhoneReadyForSubmit } from "@/modules/auth/domain/utils/phoneNumber.utils";

const optionalPhone = z
  .string()
  .trim()
  .refine((value) => !value || isPhoneReadyForSubmit(value), { message: "invalidPhone" });

const requiredPhone = z
  .string()
  .trim()
  .min(1, { message: "required" })
  .refine((value) => isPhoneReadyForSubmit(value), { message: "invalidPhone" });

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
