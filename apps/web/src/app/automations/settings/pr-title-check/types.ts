import { z } from "zod";
import { validateRegEx } from "./components/form-pr-title-check-settings/regex.provider";
import { stringCantBeEmpty } from "../../../../providers/zod-rules.provider";

export const FormPrTitleCheck = z.object({
  enabled: z.boolean(),
  settings: z
    .object({
      regex: stringCantBeEmpty.refine(
        validateRegEx,
        "Invalid regular expression",
      ),
      regexExample: stringCantBeEmpty,
    })
    .refine((data) => validateRegEx(data.regex, data.regexExample), {
      message: "Does not match the regular expression",
      path: ["regexExample"],
    }),
});

export type FormPrTitleCheck = z.infer<typeof FormPrTitleCheck>;
