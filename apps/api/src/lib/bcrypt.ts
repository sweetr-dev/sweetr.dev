import bcrypt from "bcrypt";

export const bcryptHash = async (value: string) => {
  return bcrypt.hash(value, 10);
};

export const bcryptCompare = async (value: string, hash: string) => {
  return bcrypt.compare(value, hash);
};
