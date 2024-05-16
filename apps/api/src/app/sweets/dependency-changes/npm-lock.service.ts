import { PackageLock } from "./lock-file.types";

export const parseNpmLock = (contents: string): PackageLock => {
  return PackageLock.parse(JSON.parse(contents));
};
