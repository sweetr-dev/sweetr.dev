import { z } from "zod";
import { stringCantBeEmpty } from "../../../providers/zod-rules.provider";
import { DeploymentSettingsTrigger } from "@sweetr/graphql-types/frontend/graphql";

export const ApplicationForm = z.object({
  applicationId: z.string().min(1).optional(),
  workspaceId: z.string().min(1),
  name: stringCantBeEmpty,
  description: z.string().optional(),
  repositoryId: z.string().min(1),
  teamId: z.string().optional(),
  deploymentSettings: z.object({
    trigger: z.nativeEnum(DeploymentSettingsTrigger),
    subdirectory: z.string().optional().nullable(),
  }),
});

export type ApplicationForm = z.infer<typeof ApplicationForm>;
