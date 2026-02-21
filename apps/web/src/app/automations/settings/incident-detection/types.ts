import { z } from "zod";

export const FormIncidentDetection = z.object({
  enabled: z.boolean(),
  settings: z.object({
    revert: z.object({
      enabled: z.boolean(),
    }),
    hotfix: z.object({
      enabled: z.boolean(),
      prTitleRegEx: z.string().optional(),
      branchRegEx: z.string().optional(),
      prLabelRegEx: z.string().optional(),
    }),
    rollback: z.object({
      enabled: z.boolean(),
    }),
  }),
});

export type FormIncidentDetection = z.infer<typeof FormIncidentDetection>;
