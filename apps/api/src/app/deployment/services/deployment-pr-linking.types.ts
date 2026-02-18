import {
  Deployment,
  DeploymentChangeType,
  PullRequest,
  PullRequestTracking,
} from "@prisma/client";

export interface HandleDeploymentPullRequestAutoLinkingArgs {
  workspaceId: number;
  deploymentId: number;
}

export interface GetDeploymentCommitComparisonArgs {
  installationId: number;
  owner: string;
  repositoryFullName: string;
  base: string;
  head: string;
}

export interface UpdateDeploymentChangeTypeInput {
  deploymentId: number;
  workspaceId: number;
  changeType: DeploymentChangeType;
}

export interface FindPullRequestsByCommitHashesArgs {
  workspaceId: number;
  repositoryId: number;
  commitHashes: string[];
}

export interface LinkPullRequestsToDeploymentArgs {
  workspaceId: number;
  deploymentId: number;
  pullRequestIds: number[];
}

export interface UpdatePullRequestDeploymentTrackingArgs {
  workspaceId: number;
  pullRequest: PullRequest & { tracking: PullRequestTracking | null };
  deployment: Pick<Deployment, "id" | "deployedAt">;
}
