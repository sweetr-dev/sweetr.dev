import { Job } from "bullmq";
import { SweetQueue } from "../../../bull-mq/queues";
import { createWorker } from "../../../bull-mq/workers";
import {
  findDeploymentByIdOrThrow,
  findPreviousDeployment,
} from "../services/deployment.service";
import { logger } from "../../../lib/logger";
import { findWorkspaceById } from "../../workspaces/services/workspace.service";
import { ResourceNotFoundException } from "../../errors/exceptions/resource-not-found.exception";
import { Deployment, DeploymentChangeType } from "@prisma/client";
import {
  findPullRequestsByCommitHashes,
  getDeploymentCommitComparison,
  linkPullRequestsToDeployment,
  updateDeploymentChangeType,
} from "../services/deployment-pr-linking.service";

interface DeploymentAutoLinkPullRequestsJobData {
  deploymentId: number;
  workspaceId: number;
}

export const deploymentAutoLinkPullRequestsWorker = createWorker(
  SweetQueue.DEPLOYMENT_AUTO_LINK_PULL_REQUESTS,
  async (job: Job<DeploymentAutoLinkPullRequestsJobData>) => {
    logger.info("[DEPLOYMENT_AUTO_LINK_PULL_REQUESTS]", { data: job.data });

    const workspace = await findWorkspaceById(job.data.workspaceId);

    if (!workspace) {
      throw new ResourceNotFoundException(
        "[DEPLOYMENT_AUTO_LINK_PULL_REQUESTS] Workspace not found",
        {
          extra: { workspaceId: job.data.workspaceId },
        }
      );
    }

    const deployment = await findDeploymentByIdOrThrow(
      {
        workspaceId: job.data.workspaceId,
        deploymentId: job.data.deploymentId,
      },
      {
        include: {
          application: {
            include: {
              repository: true,
            },
          },
        },
      }
    );

    const previousDeployment = await findPreviousDeployment(
      deployment as Deployment
    );

    if (!previousDeployment) {
      // First time deploying this application. Set it to the baseline. Don't link any PRs.
      await updateDeploymentToBaseline(
        job.data.deploymentId,
        job.data.workspaceId
      );

      return;
    }

    if (!workspace.installation) {
      throw new ResourceNotFoundException(
        "[DEPLOYMENT_AUTO_LINK_PULL_REQUESTS] Installation not found",
        {
          extra: { workspaceId: job.data.workspaceId },
        }
      );
    }
    const owner =
      workspace.organization?.handle || workspace.gitProfile?.handle;

    if (!owner) {
      throw new ResourceNotFoundException(
        "[DEPLOYMENT_AUTO_LINK_PULL_REQUESTS] Owner not found",
        {
          extra: { workspaceId: job.data.workspaceId },
        }
      );
    }

    const { changeType, commits } = await getDeploymentCommitComparison({
      installationId: workspace.installation.id,
      owner,
      repositoryFullName: deployment.application.repository.fullName,
      base: previousDeployment.commitHash,
      head: deployment.commitHash,
    });

    await updateDeploymentChangeType({
      workspaceId: job.data.workspaceId,
      deploymentId: job.data.deploymentId,
      changeType,
    });

    if (
      changeType === DeploymentChangeType.DIVERGED ||
      changeType === DeploymentChangeType.NO_CHANGE
    ) {
      // No PRs to link
      return;
    }

    const pullRequests = await findPullRequestsByCommitHashes({
      workspaceId: job.data.workspaceId,
      repositoryId: deployment.application.repositoryId,
      commitHashes: commits,
    });

    const deploymentSettings = deployment.application.deploymentSettings as {
      subdirectory?: string;
    };

    const filteredPullRequests = deploymentSettings?.subdirectory
      ? pullRequests.filter((pr) => {
          const files = pr.files ? (pr.files as { path: string }[]) : [];

          return files.some((file) =>
            file.path.startsWith(deploymentSettings.subdirectory as string)
          );
        })
      : pullRequests;

    if (filteredPullRequests.length === 0) {
      logger.info(
        "[DEPLOYMENT_AUTO_LINK_PULL_REQUESTS] Found no PRs that belong to the application's monorepository subdirectory",
        {
          deploymentId: job.data.deploymentId,
          workspaceId: job.data.workspaceId,
          pullRequests,
          subdirectory: deploymentSettings?.subdirectory,
        }
      );

      return;
    }

    await linkPullRequestsToDeployment({
      workspaceId: job.data.workspaceId,
      deploymentId: job.data.deploymentId,
      pullRequestIds: filteredPullRequests.map((pr) => pr.id),
    });
  }
);

const updateDeploymentToBaseline = async (
  deploymentId: number,
  workspaceId: number
) => {
  logger.info("[DEPLOYMENT_AUTO_LINK_PULL_REQUESTS] Setting baseline", {
    deploymentId,
    workspaceId,
  });

  await updateDeploymentChangeType({
    workspaceId: workspaceId,
    deploymentId: deploymentId,
    changeType: DeploymentChangeType.BASELINE,
  });
};
