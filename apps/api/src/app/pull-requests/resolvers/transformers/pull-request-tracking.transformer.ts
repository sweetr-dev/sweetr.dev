import {
  PullRequestTracking as DatabasePullRequestTracking,
  PullRequestState,
  PullRequest as DatabasePullRequest,
} from "@prisma/client";
import {
  PullRequestTracking as ApiPullRequestTracking,
  PullRequestSize,
} from "../../../../graphql-types";
import { differenceInBusinessMilliseconds } from "../../../../lib/date";

type PullRequest = Pick<
  DatabasePullRequest,
  "createdAt" | "state" | "mergedAt"
>;

export const transformPullRequestTracking = ({
  tracking,
  pullRequest,
}: {
  tracking: DatabasePullRequestTracking | null;
  pullRequest: PullRequest;
}): ApiPullRequestTracking => {
  if (!tracking) {
    return {
      size: PullRequestSize.MEDIUM,
      changedFilesCount: 0,
      linesAddedCount: 0,
      linesDeletedCount: 0,
      firstApprovalAt: null,
      firstReviewAt: null,
      firstDeployedAt: null,
      timeToCode: null,
      timeToFirstApproval: null,
      timeToFirstReview: null,
      timeToMerge: null,
      timeToDeploy: null,
      cycleTime: null,
    };
  }

  const startedCodingAt =
    tracking.firstCommitAt && tracking.firstCommitAt > pullRequest.createdAt
      ? pullRequest.createdAt
      : (tracking.firstCommitAt ?? pullRequest.createdAt);

  return {
    size: tracking.size as PullRequestSize,
    changedFilesCount: tracking.changedFilesCount,
    linesAddedCount: tracking.linesAddedCount,
    linesDeletedCount: tracking.linesDeletedCount,
    firstApprovalAt: tracking.firstApprovalAt?.toISOString(),
    firstReviewAt: tracking.firstReviewAt?.toISOString(),
    timeToCode: tracking.timeToCode,
    firstDeployedAt: tracking.firstDeployedAt?.toISOString(),
    timeToFirstApproval: calculateTimeForEvent({
      from:
        tracking.firstReviewAt ||
        tracking.firstReadyAt ||
        pullRequest.createdAt,
      duration: tracking.timeToFirstApproval,
      pullRequest,
      uselessAfterMerge: true,
    }),
    timeToFirstReview: calculateTimeForEvent({
      from: tracking.firstReadyAt || pullRequest.createdAt,
      duration: tracking.timeToFirstReview,
      pullRequest,
      uselessAfterMerge: true,
    }),
    timeToMerge: calculateTimeForEvent({
      from: tracking.firstReadyAt || pullRequest.createdAt,
      duration: tracking.timeToMerge,
      pullRequest,
      uselessAfterMerge: true,
    }),
    timeToDeploy: calculateTimeForEvent({
      from: pullRequest.mergedAt || pullRequest.createdAt,
      duration: tracking.timeToDeploy,
      pullRequest,
      uselessAfterMerge: false,
    }),
    cycleTime: calculateTimeForEvent({
      from: startedCodingAt,
      duration: tracking.cycleTime,
      pullRequest,
      uselessAfterMerge: false,
    }),
  };
};

const calculateTimeForEvent = ({
  from,
  duration,
  pullRequest,
  uselessAfterMerge = false,
}: {
  from: Date | null;
  duration: bigint | null;
  pullRequest?: PullRequest;
  uselessAfterMerge?: boolean;
}) => {
  if (duration !== null) return duration;

  if (!from) return null;

  if (pullRequest?.state === PullRequestState.CLOSED) {
    return null;
  }

  if (uselessAfterMerge && pullRequest?.state === PullRequestState.MERGED) {
    return null;
  }

  return BigInt(differenceInBusinessMilliseconds(from, new Date()));
};
