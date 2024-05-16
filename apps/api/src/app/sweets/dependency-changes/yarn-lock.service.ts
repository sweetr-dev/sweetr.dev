import { PackageLock } from "./lock-file.types";
import { parse } from "@yarnpkg/lockfile";

export const parseYarnLock = (content: string): PackageLock => {
  const yarnLockObject = parse(content);

  const packageLock = { dependencies: {} };

  Object.entries(yarnLockObject.object).forEach(
    // @ts-expect-error TO-DO: Typecheck
    ([nameWithVersion, { version, resolved, integrity }]) => {
      const name = nameWithVersion.split("@").slice(0, -1).join("@");

      packageLock.dependencies[name] = {
        version,
        resolved,
        integrity,
      };
    }
  );

  return PackageLock.parse(packageLock);
};
