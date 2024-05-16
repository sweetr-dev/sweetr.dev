import crypto from "crypto";

export const getRandomString = (length: number): string => {
  return crypto.randomBytes(length).toString("base64");
};
