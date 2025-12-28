import { DeploymentSettingsTrigger } from "@sweetr/graphql-types/frontend/graphql";
import { z } from "zod";
import { stringCantBeEmpty } from "../../../providers/zod-rules.provider";

export const ApplicationForm = z.object({
  applicationId: z.string().nonempty("Field is empty").optional(),
  workspaceId: z.string().nonempty("Field is empty"),
  name: stringCantBeEmpty,
  description: z.string().optional(),
  repositoryId: z.string().nonempty("Field is empty"),
  teamId: z.string().optional(),
  deploymentSettings: z
    .object({
      trigger: z.nativeEnum(DeploymentSettingsTrigger),
      targetBranch: z.string().optional().nullable(),
      subdirectory: z
        .string()
        .optional()
        .nullable()
        .refine((value) => !value?.startsWith("/"), {
          message: "Should not start with a slash",
        }),
    })
    .superRefine((data, ctx) => {
      if (
        data.trigger === DeploymentSettingsTrigger.MERGE &&
        !data.targetBranch
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Field is empty",
          path: ["targetBranch"],
        });
      }
    }),
});

export type ApplicationForm = z.infer<typeof ApplicationForm>;
