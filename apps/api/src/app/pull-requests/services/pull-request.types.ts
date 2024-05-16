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
