import { z } from "zod";

export const BaseFormAlert = z.object({
  enabled: z.boolean().default(false),
  channel: z
    .string()
    .nonempty("Field is empty")
    .refine((val) => !val.startsWith("#"), {
      message: "Channel should not start with #",
    })
    .default(""),
  settings: z.object({}).default({}),
});

export type BaseFormAlert = z.infer<typeof BaseFormAlert>;

export const FormSlowMergeAlert = BaseFormAlert.extend({
  settings: z.object({
    maxWaitInHours: z.number().min(1).max(168).default(1),
  }),
});
export type FormSlowMergeAlert = z.infer<typeof FormSlowMergeAlert>;

export const FormSlowReviewAlert = BaseFormAlert.extend({
  settings: z.object({
    maxWaitInHours: z.number().min(1).max(168).default(1),
  }),
});
export type FormSlowReviewAlert = z.infer<typeof FormSlowReviewAlert>;

export const FormMergedWithoutReviewAlert = BaseFormAlert;
export type FormMergedWithoutReviewAlert = BaseFormAlert;

export const FormHotPrAlert = BaseFormAlert;
export type FormHotPrAlert = BaseFormAlert;

export const FormUnreleasedChangesAlert = BaseFormAlert;
export type FormUnreleasedChangesAlert = BaseFormAlert;
