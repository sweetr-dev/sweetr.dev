import { z } from "zod";

export const FormDigest = z.object({
  enabled: z.boolean(),
  channel: z.string(),
  frequency: z.string(),
  dayOfTheWeek: z.number(),
  timeOfDay: z.string(),
  timezone: z.string(),
});

export type FormDigest = z.infer<typeof FormDigest>;
