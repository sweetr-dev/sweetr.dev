import { z } from "zod";

export const FormDigest = z.object({
  enabled: z.boolean(),
  channel: z.string().min(1),
  frequency: z.string().min(1),
  dayOfTheWeek: z.number().min(0).max(6),
  timeOfDay: z.string().min(1),
  timezone: z.string().min(1),
});

export type FormDigest = z.infer<typeof FormDigest>;

export const FormMetricsDigest = FormDigest;
export type FormMetricsDigest = FormDigest;

export const FormWipDigest = FormDigest;
export type FormWipDigest = FormDigest;
