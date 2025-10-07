import { PullRequest as DatabasePullRequest } from "@prisma/client";
import {
  PullRequest as ApiPullRequest,
  PullRequestState,
} from "../../../../graphql-types";

export const transformPullRequest = (
  pullRequest: DatabasePullRequest
): Omit<ApiPullRequest, "repository" | "tracking" | "author"> => {
  return {
    ...pullRequest,
    closedAt: pullRequest.closedAt?.toISOString(),
    mergedAt: pullRequest.mergedAt?.toISOString(),
    createdAt: pullRequest.createdAt.toISOString(),
    state: pullRequest.state as PullRequestState,
  };
};
