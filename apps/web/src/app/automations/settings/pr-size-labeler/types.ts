import { z } from "zod";
import { mustBeHexadecimal } from "../../../../providers/zod-rules.provider";

export const FormPrSizeLabeler = z.object({
  enabled: z.boolean(),
  settings: z.object({
    tiny: z.object({
      label: z.string().min(1),
      color: mustBeHexadecimal,
    }),
    small: z.object({
      label: z.string().min(1),
      color: mustBeHexadecimal,
    }),
    medium: z.object({
      label: z.string().min(1),
      color: mustBeHexadecimal,
    }),
    large: z.object({
      label: z.string().min(1),
      color: mustBeHexadecimal,
    }),
    huge: z.object({
      label: z.string().min(1),
      color: mustBeHexadecimal,
    }),
  }),
});

export type FormPrSizeLabeler = z.infer<typeof FormPrSizeLabeler>;
