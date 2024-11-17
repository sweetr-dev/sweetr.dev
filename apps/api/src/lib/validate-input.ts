import { z } from "zod";
import { InputValidationException } from "../app/errors/exceptions/input-validation.exception";

export const validateInputOrThrow = <T>(
  schema: z.ZodSchema<T>,
  input: unknown
): T => {
  try {
    return schema.parse(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new InputValidationException(`Invalid input`, {
        validationErrors: error.errors.map((e) => e.message),
        severity: "debug",
      });
    }
    throw error;
  }
};
