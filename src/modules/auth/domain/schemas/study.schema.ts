import { isValidPhoneNumber } from "react-phone-number-input";
import { z } from "zod";

export const studySchema = z.object({
  fullName: z.string().trim().min(2, { message: "required" }),
  email: z.string().trim().email({ message: "invalidEmail" }),
  phone: z
    .string()
    .trim()
    .min(1, { message: "required" })
    .refine((value) => isValidPhoneNumber(value), { message: "invalidPhone" }),
  address: z.string().trim().optional(),
  password: z
    .string()
    .min(8, { message: "passwordMin" })
    .regex(/\d/, { message: "passwordNumber" })
    .regex(/[^A-Za-z0-9]/, { message: "passwordSymbol" }),
});

export type StudySchemaInput = z.infer<typeof studySchema>;
