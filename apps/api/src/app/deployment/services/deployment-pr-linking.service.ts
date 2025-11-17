import { DeploymentChangeType } from "@prisma/client";
import { getInstallationOctoKit } from "../../../lib/octokit";
import { getPrisma } from "../../../prisma";
import {
  FindPullRequestsByCommitHashesArgs,
  GetDeploymentCommitComparisonArgs,
  LinkPullRequestsToDeploymentArgs,
  UpdateDeploymentChangeTypeInput,
} from "./deployment-pr-linking.types";

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
