import { z } from "zod";

export const WorkspaceSettings = z.object({
  pullRequest: z.object({
    size: z.object({
      tiny: z.number().min(1),
      small: z.number().min(1),
      medium: z.number().min(1),
      large: z.number().min(1),
      ignorePatterns: z.array(z.string()),
    }),
  }),
  auth: z.object({
    loginPolicy: z.enum(["WHOLE_ORG", "ONLY_ADMINS"]),
  }),
});

export type WorkspaceSettings = z.infer<typeof WorkspaceSettings>;
