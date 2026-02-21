import { z } from "zod";
import { validateRegEx } from "../../../../providers/validation.provider";

export const FormIncidentDetection = z.object({
  enabled: z.boolean(),
  settings: z.object({
    revert: z.object({
      enabled: z.boolean(),
    }),
    hotfix: z.object({
      enabled: z.boolean(),
      prTitleRegEx: z
        .string()
        .refine(validateRegEx, "Invalid regular expression")
        .optional(),
      branchRegEx: z
        .string()
        .refine(validateRegEx, "Invalid regular expression")
        .optional(),
      prLabelRegEx: z
        .string()
        .refine(validateRegEx, "Invalid regular expression")
        .optional(),
    }),
    rollback: z.object({
      enabled: z.boolean(),
    }),
  }),
});

export type FormIncidentDetection = z.infer<typeof FormIncidentDetection>;
