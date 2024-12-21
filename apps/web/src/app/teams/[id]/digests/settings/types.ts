import {
  DayOfTheWeek,
  DigestFrequency,
} from "@sweetr/graphql-types/frontend/graphql";
import { z } from "zod";

export const FormDigest = z.object({
  enabled: z.boolean(),
  channel: z.string().min(1),
  frequency: z.nativeEnum(DigestFrequency),
  dayOfTheWeek: z.array(z.nativeEnum(DayOfTheWeek)).min(1),
  timeOfDay: z.string().min(1),
  timezone: z.string().min(1),
});

export type FormDigest = z.infer<typeof FormDigest>;

export const FormMetricsDigest = FormDigest;
export type FormMetricsDigest = FormDigest;

export const FormWipDigest = FormDigest;
export type FormWipDigest = FormDigest;
