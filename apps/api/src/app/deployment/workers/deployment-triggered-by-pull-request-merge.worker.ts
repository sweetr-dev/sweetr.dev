import { Job } from "bullmq";
import { SweetQueue } from "../../../bull-mq/queues";
import { createWorker } from "../../../bull-mq/workers";
import { logger } from "../../../lib/logger";
import { DeploymentSettingsTrigger } from "../../applications/services/application.types";
import {
  DEFAULT_PRODUCTION_ENVIRONMENT_NAME,
  findOrCreateEnvironment,
} from "../../environments/services/environment.service";
import { ResourceNotFoundException } from "../../errors/exceptions/resource-not-found.exception";
import { findRepositoryById } from "../../repositories/services/repository.service";
import { createDeploymentFromPullRequestMerge } from "../services/deployment-create-from-merge.service";
import { findPullRequestById } from "../../pull-requests/services/pull-request.service";

interface DeploymentTriggeredByPullRequestMergeJobData {
  workspaceId: number;
  pullRequestId: number;
  installationId: string;
}

export const deploymentTriggeredByPullRequestMergeWorker = createWorker(
  SweetQueue.DEPLOYMENT_TRIGGERED_BY_PULL_REQUEST_MERGE,
  async (job: Job<DeploymentTriggeredByPullRequestMergeJobData>) => {
    logger.info("deploymentTriggeredByPullRequestMergeWorker", job.data);

    const { workspaceId, pullRequestId } = job.data;

    if (!workspaceId) {
      throw new ResourceNotFoundException("Workspace not found", {
        extra: { data: job.data },
      });
    }

    const pullRequest = await findPullRequestById({
      workspaceId,
      pullRequestId,
      include: {
        tracking: true,
      },
    });

    if (!pullRequest) {
      throw new ResourceNotFoundException("Pull request not found", {
        extra: { data: job.data },
      });
    }

    const repository = await findRepositoryById({
      workspaceId,
      repositoryId: pullRequest.repositoryId,
      include: {
        applications: {
          where: {
            AND: [
              {
                deploymentSettings: {
                  path: ["trigger"],
                  equals: DeploymentSettingsTrigger.MERGE,
                },
              },
              {
                deploymentSettings: {
                  path: ["targetBranch"],
                  equals: pullRequest.targetBranch,
                },
              },
            ],
          },
        },
      },
    });

    if (!repository) {
      throw new ResourceNotFoundException("Repository not found");
    }

    if (!pullRequest.mergedAt || !pullRequest.mergeCommitSha) {
      logger.info(
        "deploymentTriggeredByPullRequestMergeWorker: Pull request not merged",
        job.data
      );

      return;
    }

    if (!repository.applications?.length) {
      logger.info(
        "deploymentTriggeredByPullRequestMergeWorker: No applications found",
        job.data
      );

      return;
    }

    const environment = await findOrCreateEnvironment({
      workspaceId: workspaceId,
      name: DEFAULT_PRODUCTION_ENVIRONMENT_NAME,
    });

    const promises = repository.applications.map(async (application) =>
      createDeploymentFromPullRequestMerge({
        application,
        environment,
        pullRequest,
        workspaceId: workspaceId,
      })
    );

    await Promise.all(promises);
  }
);
