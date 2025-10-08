import {
  DayOfTheWeek,
  DigestFrequency,
} from "@sweetr/graphql-types/frontend/graphql";
import { z } from "zod";

export const FormDigest = z.object({
  enabled: z.boolean(),
  channel: z
    .string()
    .nonempty("Field is empty")
    .refine((val) => !val.startsWith("#"), {
      message: "Channel should not start with #",
    }),
  frequency: z.nativeEnum(DigestFrequency),
  dayOfTheWeek: z.array(z.nativeEnum(DayOfTheWeek)).nonempty("Field is empty"),
  timeOfDay: z.string().nonempty("Field is empty"),
  timezone: z.string().nonempty("Field is empty"),
});

export type FormDigest = z.infer<typeof FormDigest>;

export const FormMetricsDigest = FormDigest;
export type FormMetricsDigest = FormDigest;

export const FormWipDigest = FormDigest;
export type FormWipDigest = FormDigest;
