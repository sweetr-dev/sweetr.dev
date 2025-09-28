import { z } from "zod";
import { authorizeWorkspaceMemberOrThrow } from "./authorization.service";
import { InputValidationException } from "./errors/exceptions/input-validation.exception";
import { findDeploymentByIdOrThrow } from "./deployment/services/deployment.service";
import { findApplicationByIdOrThrow } from "./applications/services/application.service";
import { findRepositoryByIdOrThrow } from "./repositories/services/repository.service";
import { findTeamByIdOrThrow } from "./teams/services/team.service";

export const validateInputOrThrow = async <T extends z.ZodType<any, any, any>>(
  schema: T,
  input: z.input<T>
): Promise<z.output<T>> => {
  try {
    return await schema.parseAsync(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new InputValidationException(`Invalid input`, {
        validationErrors: error.errors.map((e) => e.message),
        severity: "debug",
      });
    }

    throw error;
  }
};

export const workspaceMemberValidator = (workspaceId: number) =>
  z.number().transform(async (gitProfileId) => {
    if (gitProfileId) {
      await authorizeWorkspaceMemberOrThrow({
        gitProfileId: gitProfileId,
        workspaceId,
      });
    }

    return gitProfileId;
  });

export const deploymentValidator = (workspaceId: number) =>
  z.number().transform(async (deploymentId) => {
    if (deploymentId) {
      await findDeploymentByIdOrThrow({ deploymentId, workspaceId });
    }

    return deploymentId;
  });

export const applicationValidator = (workspaceId: number) =>
  z.number().transform(async (applicationId) => {
    if (applicationId) {
      await findApplicationByIdOrThrow({ applicationId, workspaceId });
    }

    return applicationId;
  });

export const teamValidator = (workspaceId: number) =>
  z.number().transform(async (teamId) => {
    if (teamId) {
      await findTeamByIdOrThrow({ teamId, workspaceId });
    }

    return teamId;
  });

export const repositoryValidator = (workspaceId: number) =>
  z.number().transform(async (repositoryId) => {
    if (repositoryId) {
      await findRepositoryByIdOrThrow({ repositoryId, workspaceId });
    }

    return repositoryId;
  });
