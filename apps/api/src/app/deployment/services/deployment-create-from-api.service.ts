import { upsertApplication } from "../../applications/services/application.service";
import { DeploymentSettingsTrigger } from "../../applications/services/application.types";
import { findOrCreateEnvironment } from "../../environments/services/environment.service";
import { ResourceNotFoundException } from "../../errors/exceptions/resource-not-found.exception";
import { findGitProfileByHandle } from "../../people/services/people.service";
import { findRepositoryByFullName } from "../../repositories/services/repository.service";
import { HandleDeploymentTriggeredByApiArgs } from "./deployment-create-from-api.types";
import { upsertDeployment } from "./deployment.service";

export const handleDeploymentTriggeredByApi = async (
  input: HandleDeploymentTriggeredByApiArgs
) => {
  const environment = await findOrCreateEnvironment({
    workspaceId: input.workspaceId,
    name: input.environment,
  });

  const repository = await findRepositoryByFullName({
    workspaceId: input.workspaceId,
    fullName: input.repositoryFullName,
  });

  if (!repository) {
    throw new ResourceNotFoundException("Repository not found");
  }

  const author = input.author
    ? await findGitProfileByHandle({
        workspaceId: input.workspaceId,
        handle: input.author,
      })
    : null;

  const application = await upsertApplication({
    workspaceId: input.workspaceId,
    name: input.app,
    repositoryId: repository.id,
    deploymentSettings: {
      trigger: DeploymentSettingsTrigger.WEBHOOK,
      ...(input.monorepoPath
        ? { subdirectory: input.monorepoPath }
        : undefined),
    },
  });

  return upsertDeployment({
    workspaceId: input.workspaceId,
    environmentId: environment.id,
    applicationId: application.id,
    authorId: author?.id,
    deployedAt: input.deployedAt,
    commitHash: input.commitHash,
    version: input.version,
    description: input.description,
  });
};
