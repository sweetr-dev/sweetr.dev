import { z } from "zod";
import { repositoryValidator, teamValidator } from "../../validator.service";
import { DeploymentSettingsTrigger } from "./application.types";
import { STRING_INPUT_MAX_LENGTH } from "../../../lib/validate-input";

export const getApplicationValidationSchema = (workspaceId: number) =>
  z.object({
    workspaceId: z.number(),
    name: z.string().max(STRING_INPUT_MAX_LENGTH),
    repositoryId: repositoryValidator(workspaceId),
    deploymentSettings: z.object({
      trigger: z.nativeEnum(DeploymentSettingsTrigger),
      subdirectory: z
        .string()
        .max(STRING_INPUT_MAX_LENGTH)
        .optional()
        .nullable(),
    }),
    // Optional fields
    applicationId: z.number().optional(),
    teamId: teamValidator(workspaceId).optional().nullable(),
    description: z.string().max(STRING_INPUT_MAX_LENGTH).optional().nullable(),
  });
