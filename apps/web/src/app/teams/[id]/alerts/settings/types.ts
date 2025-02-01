import { z } from "zod";

export const FormAlert = z.object({
  enabled: z.boolean().default(false),
  channel: z
    .string()
    .min(1, "Field is required")
    .refine((val) => !val.startsWith("#"), {
      message: "Channel should not start with #",
    })
    .default(""),
});

export type FormAlert = z.infer<typeof FormAlert>;

export const FormSlowMergeAlert = FormAlert;
export type FormSlowMergeAlert = FormAlert;

export const FormSlowReviewAlert = FormAlert;
export type FormSlowReviewAlert = FormAlert;

export const FormMergedWithoutReviewAlert = FormAlert;
export type FormMergedWithoutReviewAlert = FormAlert;

export const FormHotPrAlert = FormAlert;
export type FormHotPrAlert = FormAlert;

export const FormUnreleasedChangesAlert = FormAlert;
export type FormUnreleasedChangesAlert = FormAlert;
