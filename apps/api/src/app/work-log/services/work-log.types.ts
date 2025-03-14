import { CodeReview, PullRequest } from "@prisma/client";

export interface WorkLogData {
  codeReviews: CodeReview[];
  createdPullRequests: PullRequest[];
  mergedPullRequests: PullRequest[];
}

export interface GetTeamWorkLogArgs {
  workspaceId: number;
  teamId: number;
  startDate: Date;
  endDate: Date;
}
