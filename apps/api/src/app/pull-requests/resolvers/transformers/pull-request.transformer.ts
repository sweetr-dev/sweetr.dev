import { PullRequest as DatabasePullRequest, GitProfile } from "@prisma/client";
import {
  PullRequest as ApiPullRequest,
  PullRequestState,
} from "@sweetr/graphql-types/api";

export const transformPullRequest = (
  pullRequest: DatabasePullRequest & {
    author: GitProfile;
  }
): Omit<ApiPullRequest, "repository" | "tracking" | "author"> => {
  return {
    ...pullRequest,
    closedAt: pullRequest.closedAt?.toISOString(),
    mergedAt: pullRequest.mergedAt?.toISOString(),
    createdAt: pullRequest.createdAt.toISOString(),
    state: pullRequest.state as PullRequestState,
  };
};
