import RE2 from "re2";
import { logger } from "./logger";

export const safeRegex = (pattern: string): RE2 | null => {
  try {
    if (pattern.length > 255) {
      logger.warn("safeRegex: Pattern is too long, skipping", { pattern });
      return null;
    }

    return new RE2(pattern);
  } catch {
    logger.info("safeRegex: Invalid regex pattern, skipping", { pattern });
    return null;
  }
};
