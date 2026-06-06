import { z } from "zod";

export const accountSchema = z.object({
  countryId: z
    .number({ message: "required" })
    .int()
    .positive({ message: "required" }),
  educationLevelId: z
    .number({ message: "required" })
    .int()
    .positive({ message: "required" }),
  gradeId: z
    .number({ message: "required" })
    .int()
    .positive({ message: "required" }),
  schoolId: z.string().trim().min(1, { message: "required" }),
});

export type AccountSchemaInput = z.infer<typeof accountSchema>;
