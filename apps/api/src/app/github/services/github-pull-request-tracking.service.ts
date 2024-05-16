import { isAfter } from "date-fns";
import { differenceInBusinessMilliseconds } from "../../../lib/date";
import { PullRequest, PullRequestSize, PullRequestState } from "@prisma/client";

/**
 * We need to iterate over the Pull Request timeline to properly assess
 * at what time it was drafted or set as ready to review
 */
export const getFirstDraftAndReadyDates = (
  pullRequest: PullRequest,
  prGitData: any // TO-DO: Add type
) => {
  let firstDraftedAt: Date | null = null;
  let firstReadyAt: Date | null = null;
  const sortedTimelineItems = (prGitData?.timelineItems?.nodes || []).sort(
    (a, b) => a.createdAt.localeCompare(b.createdAt)
  );

  const firstEvent: string | undefined = sortedTimelineItems[0]?.__typename;

  // No events, assess current state only
  if (!firstEvent) {
    firstDraftedAt =
      pullRequest.state === PullRequestState.DRAFT
        ? pullRequest.createdAt
        : null;

    firstReadyAt =
      pullRequest.state !== PullRequestState.DRAFT
        ? pullRequest.createdAt
        : null;
  }

  // PR was created as a draft
  if (firstEvent === "ReadyForReviewEvent") {
    firstDraftedAt = pullRequest.createdAt;
  }

  // PR was created as ready
  if (firstEvent === "ConvertToDraftEvent") {
    firstReadyAt = pullRequest.createdAt;
  }

  if (!firstDraftedAt && sortedTimelineItems.length) {
    const firstReadyForReviewEventAt = sortedTimelineItems.find(
      (item) => item.__typename === "ConvertToDraftEvent"
    )?.createdAt;

    firstDraftedAt = firstReadyForReviewEventAt || null;
  }

  if (!firstReadyAt && sortedTimelineItems.length) {
    const firstReadyForReviewEventAt = sortedTimelineItems.find(
      (item) => item.__typename === "ReadyForReviewEvent"
    )?.createdAt;

    firstReadyAt = firstReadyForReviewEventAt || null;
  }

  return { firstReadyAt, firstDraftedAt };
};

/**
 * Time between the first commit, and the Pull Request being ready
 */
export const getTimeToCode = (
  firstCommitAt: Date | null,
  firstReadyAt?: Date | null
) => {
  if (!firstCommitAt || !firstReadyAt) return undefined;

  return differenceInBusinessMilliseconds(firstCommitAt, firstReadyAt);
};

/**
 * Time between the first approval (or PR creation date) and the PR being merged
 */
export const getTimeToMerge = (
  pullRequest: PullRequest,
  firstApprovalAt?: Date | null
) => {
  const compareWith = firstApprovalAt || pullRequest.createdAt;

  if (!pullRequest.mergedAt) return undefined;

  return differenceInBusinessMilliseconds(compareWith, pullRequest.mergedAt);
};

/**
 * Time between the first commit and the PR being merged
 */
export const getCycleTime = (
  pullRequest: PullRequest,
  firstCommitAt: Date | null
) => {
  if (!firstCommitAt) return undefined;

  if (!pullRequest.mergedAt) return undefined;

  return differenceInBusinessMilliseconds(firstCommitAt, pullRequest.mergedAt);
};

/**
 * Time between x and the PR's first review
 */
export const getTimeForReview = (startDate: Date, reviewAt: Date | null) => {
  if (!reviewAt) {
    return undefined;
  }

  return differenceInBusinessMilliseconds(startDate, reviewAt);
};

export const getReviewCompareTime = (
  reviewAt: Date,
  prCreatedAt: Date,
  firstReviewerRequestedAt?: Date | null,
  firstReadyAt?: Date | null
) => {
  if (firstReviewerRequestedAt && isAfter(reviewAt, firstReviewerRequestedAt)) {
    return firstReviewerRequestedAt;
  }

  if (firstReadyAt && isAfter(reviewAt, firstReadyAt)) {
    return firstReadyAt;
  }

  return prCreatedAt;
};

export const getPullRequestSize = (pullRequest: PullRequest) => {
  const totalChanges =
    pullRequest.linesAddedCount + pullRequest.linesDeletedCount;

  if (totalChanges < 20) return PullRequestSize.TINY;
  if (totalChanges < 100) return PullRequestSize.SMALL;
  if (totalChanges < 250) return PullRequestSize.MEDIUM;
  if (totalChanges < 500) return PullRequestSize.LARGE;

  return PullRequestSize.HUGE;
};
