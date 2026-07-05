import { isValidPhoneNumber } from "react-phone-number-input";
import { z } from "zod";

export const parentRegistrationSchema = z.object({
  countryId: z.number().int().positive({ message: "required" }),
  phone: z
    .string()
    .trim()
    .min(1, { message: "required" })
    .refine((value) => isValidPhoneNumber(value), { message: "invalidPhone" }),
  email: z.string().trim().email({ message: "invalidEmail" }),
  address: z.string().trim().optional(),
  password: z
    .string()
    .min(8, { message: "passwordMin" })
    .regex(/\d/, { message: "passwordNumber" })
    .regex(/[^A-Za-z0-9]/, { message: "passwordSymbol" }),
});

export type ParentRegistrationSchemaInput = z.infer<typeof parentRegistrationSchema>;
