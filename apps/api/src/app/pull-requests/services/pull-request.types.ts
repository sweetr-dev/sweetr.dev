import { PullRequestSize, PullRequestState } from "@prisma/client";
import { DateTimeRange } from "../../types";

export interface PaginatePullRequestsArgs {
  cursor?: number;
  teamIds?: number[];
  gitProfileIds?: number[];
  createdAt?: DateTimeRange;
  mergedAt?: DateTimeRange;
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
