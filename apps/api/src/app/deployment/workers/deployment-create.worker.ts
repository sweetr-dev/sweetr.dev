import { Job } from "bullmq";
import { addJob, SweetQueue } from "../../../bull-mq/queues";
import { createWorker } from "../../../bull-mq/workers";
import type { PostDeploymentInput } from "../services/deployment.validation";
import { findOrCreateEnvironment } from "../../environments/services/environment.service";
import { findGitProfileByHandle } from "../../people/services/people.service";
import { upsertApplication } from "../../applications/services/application.service";
import { findRepositoryByFullName } from "../../repositories/services/repository.service";
import { ResourceNotFoundException } from "../../errors/exceptions/resource-not-found.exception";
import { DeploymentSettingsTrigger } from "../../applications/services/application.types";
import { upsertDeployment } from "../services/deployment.service";
import { logger } from "../../../lib/logger";

type DeploymentCreateJobData = Omit<PostDeploymentInput, "deployedAt"> & {
  workspaceId: number;
  deployedAt: Date;
};

export const deploymentCreateWorker = createWorker(
  SweetQueue.DEPLOYMENT_CREATE,
  async (job: Job<DeploymentCreateJobData>) => {
    logger.info("deploymentCreateWorker", { data: job.data });

    const environment = await findOrCreateEnvironment({
      workspaceId: job.data.workspaceId,
      name: job.data.environment,
    });

    const repository = await findRepositoryByFullName({
      workspaceId: job.data.workspaceId,
      fullName: job.data.repositoryFullName,
    });

    if (!repository) {
      throw new ResourceNotFoundException("Repository not found");
    }

    const author = job.data.author
      ? await findGitProfileByHandle({
          workspaceId: job.data.workspaceId,
          handle: job.data.author,
        })
      : null;

    const application = await upsertApplication({
      workspaceId: job.data.workspaceId,
      name: job.data.app,
      repositoryId: repository.id,
      deploymentSettings: {
        trigger: DeploymentSettingsTrigger.WEBHOOK,
        ...(job.data.monorepoPath
          ? { subdirectory: job.data.monorepoPath }
          : undefined),
      },
    });

    const deployment = await upsertDeployment({
      workspaceId: job.data.workspaceId,
      environmentId: environment.id,
      applicationId: application.id,
      authorId: author?.id,
      deployedAt: job.data.deployedAt,
      commitHash: job.data.commitHash,
      version: job.data.version,
      description: job.data.description,
    });

    logger.info("deploymentCreateWorker: Deployment created", { deployment });

    await addJob(SweetQueue.DEPLOYMENT_AUTO_LINK_PULL_REQUESTS, {
      deploymentId: deployment.id,
      workspaceId: job.data.workspaceId,
    });
  }
);
