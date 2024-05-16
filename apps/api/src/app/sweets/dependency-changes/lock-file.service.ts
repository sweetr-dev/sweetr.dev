import semver from "semver";
import { DependencyUpdate, PackageLock } from "./lock-file.types";
import { parseYarnLock } from "./yarn-lock.service";
import { parseNpmLock } from "./npm-lock.service";
import { BusinessRuleException } from "../../errors/exceptions/business-rule.exception";
import { InputValidationException } from "../../errors/exceptions/input-validation.exception";

export const parseLockFile = (
  fileName = "package-lock.json",
  contents: string
): PackageLock => {
  try {
    if (fileName === "package-lock.json") return parseNpmLock(contents);

    if (fileName === "yarn.lock") {
      return parseYarnLock(contents);
    }
  } catch (error) {
    throw new InputValidationException("Could not parse lock file", {
      extra: { fileName, contents },
      severity: "warning",
    });
  }

  throw new BusinessRuleException("Unsupported lock file", {
    extra: { fileName, contents },
    severity: "warning",
  });
};

export const comparePackageLocks = (
  fileName = "package-lock.json",
  oldPackageLock: string,
  newPackageLock: string
): Record<string, DependencyUpdate> => {
  const oldLock = parseLockFile(fileName, oldPackageLock);
  const newLock = parseLockFile(fileName, newPackageLock);

  const updates: Record<string, DependencyUpdate> = {};

  for (const [name, oldDep] of Object.entries(oldLock.dependencies)) {
    const updatedDep = newLock.dependencies[name];

    if (!updatedDep) {
      updates[name] = {
        type: "Removed",
        dev: oldDep.dev,
        name,
        oldVersion: oldDep.version,
      };

      continue;
    }

    if (oldDep.version === updatedDep.version) continue;

    updates[name] = {
      type: semver.gt(updatedDep.version, oldDep.version)
        ? "Upgraded"
        : "Downgraded",
      name,
      dev: updatedDep.dev,
      newVersion: updatedDep.version,
      oldVersion: oldDep.version,
    };
  }

  // Check dependencies only in newLock
  for (const [name, updatedDep] of Object.entries(newLock.dependencies)) {
    if (!oldLock.dependencies[name]) {
      updates[name] = {
        type: "Added",
        name,
        dev: updatedDep.dev,
        newVersion: updatedDep.version,
      };
    }
  }

  return updates;
};
