import { DeploymentChangeType } from "@prisma/client";
import { getInstallationOctoKit } from "../../../lib/octokit";
import { getPrisma } from "../../../prisma";
import {
  FindPullRequestsByCommitHashesArgs,
  GetDeploymentCommitComparisonArgs,
  HandleDeploymentPullRequestAutoLinkingArgs,
  LinkPullRequestsToDeploymentArgs,
  UpdateDeploymentChangeTypeInput,
  UpdatePullRequestDeploymentTrackingArgs,
} from "./deployment-pr-linking.types";
import { logger } from "../../../lib/logger";
import { ResourceNotFoundException } from "../../errors/exceptions/resource-not-found.exception";
import { filterPullRequestsBySubdirectory } from "./deployment-monorepo.service";
import {
  findDeploymentByIdOrThrow,
  findLatestDeployment,
} from "./deployment.service";
import { findWorkspaceById } from "../../workspaces/services/workspace.service";
import { getTimeToDeploy } from "../../github/services/github-pull-request-tracking.service";
import { DataIntegrityException } from "../../errors/exceptions/data-integrity.exception";
import { isBefore } from "date-fns";

export const handleDeploymentPullRequestAutoLinking = async ({
  workspaceId,
  deploymentId,
}: HandleDeploymentPullRequestAutoLinkingArgs) => {
  const workspace = await findWorkspaceById(workspaceId);

  if (!workspace) {
    throw new ResourceNotFoundException(
      "handleDeploymentPullRequestAutoLinking: Workspace not found",
      {
        extra: { workspaceId },
      }
    );
  }

  const deployment = await findDeploymentByIdOrThrow(
    {
      workspaceId,
      deploymentId,
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

  const previousDeployment = await findLatestDeployment({
    workspaceId,
    applicationId: deployment.applicationId,
    environmentId: deployment.environmentId,
    beforeDeploymentId: deployment.id,
  });

  if (!previousDeployment) {
    // First time deploying this application. Set it to the baseline. Don't link any PRs.
    await updateDeploymentToBaseline(deploymentId, workspaceId);

    return;
  }

  if (!workspace.installation) {
    throw new ResourceNotFoundException(
      "handleDeploymentPullRequestAutoLinking: Installation not found",
      {
        extra: { workspaceId: workspaceId },
      }
    );
  }
  const owner = workspace.organization?.handle || workspace.gitProfile?.handle;

  if (!owner) {
    throw new ResourceNotFoundException(
      "handleDeploymentPullRequestAutoLinking: Owner not found",
      {
        extra: { workspaceId: workspaceId },
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
    workspaceId: workspaceId,
    deploymentId: deploymentId,
    changeType,
  });

  if (
    changeType === DeploymentChangeType.DIVERGED ||
    changeType === DeploymentChangeType.NO_CHANGE
  ) {
    // No PRs to link
    return;
  }

  const mergedPullRequests = await findMergedPullRequestsByCommitHashes({
    workspaceId: workspaceId,
    repositoryId: deployment.application.repositoryId,
    commitHashes: commits,
  });

  const deploymentSettings = deployment.application.deploymentSettings as {
    subdirectory?: string;
  };

  const filteredPullRequests = filterPullRequestsBySubdirectory<
    (typeof mergedPullRequests)[number]
  >({
    pullRequests: mergedPullRequests,
    subdirectory: deploymentSettings?.subdirectory,
  });

  if (filteredPullRequests.length === 0) {
    logger.info(
      "handleDeploymentPullRequestAutoLinking: Found no PRs that belong to the application's monorepository subdirectory",
      {
        deploymentId: deploymentId,
        workspaceId: workspaceId,
        pullRequests: mergedPullRequests,
        subdirectory: deploymentSettings?.subdirectory,
      }
    );

    return;
  }

  if (filteredPullRequests.some((pr) => !pr.mergedAt)) {
    throw new DataIntegrityException(
      "handleDeploymentPullRequestAutoLinking: Some PRs are not merged",
      {
        extra: { filteredPullRequests },
      }
    );
  }

  await linkPullRequestsToDeployment({
    workspaceId: workspaceId,
    deploymentId: deploymentId,
    pullRequestIds: filteredPullRequests.map((pr) => pr.id),
  });

  await Promise.all(
    filteredPullRequests.map(async (pr) => {
      return updatePullRequestDeploymentTracking({
        pullRequest: pr,
        deployment,
        workspaceId,
      });
    })
  );
};

export const updatePullRequestDeploymentTracking = async ({
  pullRequest,
  deployment,
  workspaceId,
}: UpdatePullRequestDeploymentTrackingArgs) => {
  if (!pullRequest.mergedAt) {
    throw new DataIntegrityException(
      "[updatePullRequestDeploymentTracking] Depoloyed Pull Request is not merged",
      {
        extra: { pullRequest },
      }
    );
  }

  const previousDeployedAt = pullRequest.tracking?.firstDeployedAt;

  if (
    previousDeployedAt &&
    isBefore(previousDeployedAt, deployment.deployedAt)
  ) {
    logger.info(
      "[updatePullRequestDeploymentTracking] Previous deployment is earlier than this deployment. Skipping PR tracking update.",
      {
        previousDeployedAt,
        deploymentDeployedAt: deployment.deployedAt,
        pullRequest,
        workspaceId,
      }
    );

    return;
  }

  await getPrisma(workspaceId).pullRequestTracking.update({
    where: {
      pullRequestId: pullRequest.id,
      workspaceId: workspaceId,
    },
    data: {
      firstDeployedAt: deployment.deployedAt,
      timeToDeploy: getTimeToDeploy(
        pullRequest.mergedAt,
        deployment.deployedAt
      ),
    },
  });
};

const updateDeploymentToBaseline = async (
  deploymentId: number,
  workspaceId: number
) => {
  logger.info("handleDeploymentPullRequestAutoLinking: Setting baseline", {
    deploymentId,
    workspaceId,
  });

  await updateDeploymentChangeType({
    workspaceId: workspaceId,
    deploymentId: deploymentId,
    changeType: DeploymentChangeType.BASELINE,
  });
};

export const getDeploymentCommitComparison = async ({
  installationId,
  owner,
  repositoryFullName,
  base,
  head,
}: GetDeploymentCommitComparisonArgs) => {
  const comparison = await getInstallationOctoKit(
    installationId
  ).rest.repos.compareCommits({
    owner,
    repo: repositoryFullName,
    base,
    head,
  });

  return {
    changeType: getChangeTypeFromGitHubComparisonStatus(comparison.data.status),
    commits: comparison.data.commits.map((commit) => commit.sha),
  };
};

const getChangeTypeFromGitHubComparisonStatus = (
  status: "diverged" | "ahead" | "behind" | "identical"
) => {
  const statusToChangeTypeMap: Record<
    "diverged" | "ahead" | "behind" | "identical",
    DeploymentChangeType
  > = {
    diverged: DeploymentChangeType.DIVERGED,
    identical: DeploymentChangeType.NO_CHANGE,
    ahead: DeploymentChangeType.FORWARD,
    behind: DeploymentChangeType.ROLLBACK,
  };
  return statusToChangeTypeMap[status];
};

export const findMergedPullRequestsByCommitHashes = async ({
  workspaceId,
  repositoryId,
  commitHashes,
}: FindPullRequestsByCommitHashesArgs) => {
  return getPrisma(workspaceId).pullRequest.findMany({
    where: {
      mergeCommitSha: { in: commitHashes },
      workspaceId,
      repositoryId,
      mergedAt: { not: null },
    },
    include: {
      deploymentEvents: true,
      tracking: true,
    },
  });
};

export const linkPullRequestsToDeployment = async ({
  workspaceId,
  deploymentId,
  pullRequestIds,
}: LinkPullRequestsToDeploymentArgs) => {
  await getPrisma(workspaceId).deploymentPullRequest.deleteMany({
    where: {
      deploymentId,
      workspaceId,
    },
  });

  return getPrisma(workspaceId).deploymentPullRequest.createMany({
    data: pullRequestIds.map((pullRequestId) => ({
      deploymentId,
      pullRequestId,
      workspaceId,
    })),
  });
};

export const updateDeploymentChangeType = async ({
  deploymentId,
  workspaceId,
  changeType,
}: UpdateDeploymentChangeTypeInput) => {
  return getPrisma(workspaceId).deployment.update({
    where: {
      id: deploymentId,
      workspaceId,
    },
    data: {
      changeType,
    },
  });
};
