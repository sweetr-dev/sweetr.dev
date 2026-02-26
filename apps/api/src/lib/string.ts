import { logger } from "./logger";

export const safeRegex = (pattern: string): RegExp | null => {
  try {
    return new RegExp(pattern, "i");
  } catch {
    logger.warn("safeRegex: Invalid regex pattern, skipping", { pattern });
    return null;
  }
};
