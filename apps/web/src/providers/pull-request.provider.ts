import { PullRequest } from "@sweetr/graphql-types/frontend/graphql";

export const getPullRequestChanges = (
  pullRequest: Pick<
    PullRequest,
    "linesAddedCount" | "linesDeletedCount" | "changedFilesCount" | "tracking"
  >,
) => {
  if (
    pullRequest.tracking.linesAddedCount === 0 &&
    pullRequest.tracking.linesDeletedCount === 0
  ) {
    return {
      additions: pullRequest.linesAddedCount,
      deletions: pullRequest.linesDeletedCount,
      files: pullRequest.changedFilesCount,
    };
  }

  return {
    additions: pullRequest.tracking.linesAddedCount,
    deletions: pullRequest.tracking.linesDeletedCount,
    files: pullRequest.tracking.changedFilesCount,
  };
};
