import bcrypt from "bcrypt";
import { createHash, randomBytes } from "crypto";

export const getRandomString = (length: number): string => {
  return randomBytes(length).toString("base64url").replaceAll(" ", "");
};

export const bcryptHash = async (value: string) => {
  return bcrypt.hash(value, 10);
};

export const bcryptCompare = async (value: string, hash: string) => {
  return bcrypt.compare(value, hash);
};

export const hashWithSha256 = (value: string) => {
  return createHash("sha256").update(value).digest("hex");
};
