import { DeploymentChangeType } from "@prisma/client";
import { getInstallationOctoKit } from "../../../lib/octokit";
import { getPrisma } from "../../../prisma";
import {
  FindPullRequestsByCommitHashesArgs,
  GetDeploymentCommitComparisonArgs,
  HandleDeploymentPullRequestAutoLinkingArgs,
  LinkPullRequestsToDeploymentArgs,
  UpdateDeploymentChangeTypeInput,
} from "./deployment-pr-linking.types";
import { logger } from "../../../lib/logger";
import { ResourceNotFoundException } from "../../errors/exceptions/resource-not-found.exception";
import { filterPullRequestsBySubdirectory } from "./deployment-monorepo.service";
import {
  findDeploymentByIdOrThrow,
  findLatestDeployment,
} from "./deployment.service";
import { findWorkspaceById } from "../../workspaces/services/workspace.service";

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

  const pullRequests = await findPullRequestsByCommitHashes({
    workspaceId: workspaceId,
    repositoryId: deployment.application.repositoryId,
    commitHashes: commits,
  });

  const deploymentSettings = deployment.application.deploymentSettings as {
    subdirectory?: string;
  };

  const filteredPullRequests = filterPullRequestsBySubdirectory({
    pullRequests,
    subdirectory: deploymentSettings?.subdirectory,
  });

  if (filteredPullRequests.length === 0) {
    logger.info(
      "handleDeploymentPullRequestAutoLinking: Found no PRs that belong to the application's monorepository subdirectory",
      {
        deploymentId: deploymentId,
        workspaceId: workspaceId,
        pullRequests,
        subdirectory: deploymentSettings?.subdirectory,
      }
    );

    return;
  }

  await linkPullRequestsToDeployment({
    workspaceId: workspaceId,
    deploymentId: deploymentId,
    pullRequestIds: filteredPullRequests.map((pr) => pr.id),
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

export const findPullRequestsByCommitHashes = async ({
  workspaceId,
  repositoryId,
  commitHashes,
}: FindPullRequestsByCommitHashesArgs) => {
  return getPrisma(workspaceId).pullRequest.findMany({
    where: {
      mergeCommitSha: { in: commitHashes },
      workspaceId,
      repositoryId,
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
