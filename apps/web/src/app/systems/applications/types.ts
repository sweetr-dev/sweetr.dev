import { z } from "zod";
import { stringCantBeEmpty } from "../../../providers/zod-rules.provider";
import { DeploymentSettingsTrigger } from "@sweetr/graphql-types/frontend/graphql";

export const ApplicationForm = z.object({
  applicationId: z.string().nonempty("Field is empty").optional(),
  workspaceId: z.string().nonempty("Field is empty"),
  name: stringCantBeEmpty,
  description: z.string().optional(),
  repositoryId: z.string().nonempty("Field is empty"),
  teamId: z.string().optional(),
  deploymentSettings: z.object({
    trigger: z.nativeEnum(DeploymentSettingsTrigger),
    subdirectory: z.string().optional().nullable(),
  }),
});

export type ApplicationForm = z.infer<typeof ApplicationForm>;
