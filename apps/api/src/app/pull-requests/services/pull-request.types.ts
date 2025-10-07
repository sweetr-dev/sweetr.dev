import { PullRequestSize, PullRequestState } from "@prisma/client";

interface DateTimeRange {
  from?: string;
  to?: string;
}

export interface PaginatePullRequestsArgs {
  cursor?: number;
  teamIds?: number[];
  gitProfileIds?: number[];
  createdAt?: DateTimeRange;
  finalizedAt?: DateTimeRange;
  states?: PullRequestState[];
  sizes?: PullRequestSize[];
}

export interface PullRequestFile {
  changeType: string;
  path: string;
  additions: number;
  deletions: number;
}

export interface FindPullRequestsByDeploymentIdArgs {
  workspaceId: number;
  deploymentId: number;
}

export interface CountPullRequestsByDeploymentIdArgs {
  workspaceId: number;
  deploymentId: number;
}
