import { z } from "zod";
import { accountSchema } from "@/modules/auth/domain/schemas/account.schema";
import { contactSchema } from "@/modules/auth/domain/schemas/contact.schema";
import { studySchema } from "@/modules/auth/domain/schemas/study.schema";

export const registrationSchema = accountSchema.merge(studySchema).merge(contactSchema);

export type RegistrationSchemaInput = z.infer<typeof registrationSchema>;
