import {
  PullRequestTracking as DatabasePullRequestTracking,
  PullRequestState,
} from "@prisma/client";
import {
  PullRequestTracking as ApiPullRequestTracking,
  PullRequestSize,
} from "../../../../graphql-types";
import { differenceInBusinessMilliseconds } from "../../../../lib/date";

export const transformPullRequestTracking = (
  tracking: DatabasePullRequestTracking | null,
  prCreatedAt: Date,
  prState?: PullRequestState
): ApiPullRequestTracking => {
  if (!tracking) {
    return {
      size: PullRequestSize.MEDIUM,
      changedFilesCount: 0,
      linesAddedCount: 0,
      linesDeletedCount: 0,
      firstApprovalAt: null,
      firstReviewAt: null,
      timeToFirstApproval: null,
      timeToFirstReview: null,
      timeToMerge: null,
    };
  }

  return {
    size: tracking.size as PullRequestSize,
    changedFilesCount: tracking.changedFilesCount,
    linesAddedCount: tracking.linesAddedCount,
    linesDeletedCount: tracking.linesDeletedCount,
    firstApprovalAt: tracking.firstApprovalAt?.toISOString(),
    firstReviewAt: tracking.firstReviewAt?.toISOString(),
    timeToFirstApproval: calculateTimeForEvent(
      tracking.firstApprovalAt || tracking.firstReadyAt || prCreatedAt,
      tracking.timeToFirstApproval,
      prState
    ),
    timeToFirstReview: calculateTimeForEvent(
      tracking.firstReadyAt || prCreatedAt,
      tracking.timeToFirstReview,
      prState
    ),
    timeToMerge: calculateTimeForEvent(
      tracking.firstReadyAt || prCreatedAt,
      tracking.timeToMerge,
      prState
    ),
  };
};

const calculateTimeForEvent = (
  prDate: Date | null,
  duration: bigint | null,
  prState?: PullRequestState
) => {
  if (duration) return duration;

  if (!prDate) return null;

  // If PR is already merged or closed, we don't need to calculate the time it has been open
  if (
    prState === PullRequestState.MERGED ||
    prState === PullRequestState.CLOSED
  ) {
    return null;
  }

  return BigInt(differenceInBusinessMilliseconds(prDate, new Date()));
};
