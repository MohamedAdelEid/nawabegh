import { isValidPhoneNumber } from "react-phone-number-input";
import { z } from "zod";

export const teacherRegistrationSchema = z
  .object({
    jobTitle: z.string().trim().min(2, { message: "required" }),
    schoolName: z.string().trim().min(2, { message: "required" }),
    email: z.string().trim().email({ message: "invalidEmail" }),
    phone: z
      .string()
      .trim()
      .min(1, { message: "required" })
      .refine((value) => isValidPhoneNumber(value), { message: "invalidPhone" }),
    countryId: z.number().int().positive({ message: "required" }),
    address: z.string().trim().optional(),
    password: z
      .string()
      .min(8, { message: "passwordMin" })
      .regex(/\d/, { message: "passwordNumber" })
      .regex(/[^A-Za-z0-9]/, { message: "passwordSymbol" }),
    confirmPassword: z.string().min(1, { message: "required" }),
    acceptTerms: z.boolean().refine((value) => value === true, {
      message: "acceptTerms",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "passwordMismatch",
    path: ["confirmPassword"],
  });

export type TeacherRegistrationSchemaInput = z.infer<typeof teacherRegistrationSchema>;
