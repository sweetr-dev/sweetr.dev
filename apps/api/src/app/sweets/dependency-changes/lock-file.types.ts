import z from "zod";

export const PackageLock = z.object({
  dependencies: z.record(
    z.string(),
    z.object({
      version: z.string(),
      resolved: z.string(),
      integrity: z.string(),
      dev: z.boolean().optional(),
      requires: z.record(z.string()).optional(),
    })
  ),
});

export type PackageLock = z.infer<typeof PackageLock>;

export type DependencyUpdate =
  | {
      name: string;
      dev?: boolean;
    } & (
      | {
          type: "Upgraded" | "Downgraded";
          newVersion: string;
          oldVersion: string;
        }
      | {
          type: "Removed";
          oldVersion: string;
        }
      | {
          type: "Added";
          newVersion: string;
        }
    );
