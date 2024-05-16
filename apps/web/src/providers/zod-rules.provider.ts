import { z } from "zod";

export const mustBeHexadecimal = z
  .string()
  .length(7, { message: "Must be a hexadecimal value" })
  .startsWith("#", { message: "Must be a hexadecimal value" });

export const stringCantBeEmpty = z
  .string()
  .min(1, { message: "Field is empty" });
