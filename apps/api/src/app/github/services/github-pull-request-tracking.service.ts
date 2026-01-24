import { isAfter } from "date-fns";
import { differenceInBusinessMilliseconds } from "../../../lib/date";
import {
  PullRequest,
  PullRequestSize,
  PullRequestState,
  Workspace,
} from "@prisma/client";
import { sum } from "radash";
import { PullRequestFile } from "../../pull-requests/services/pull-request.types";
import micromatch from "micromatch";
import { getWorkspaceSettings } from "../../workspaces/services/workspace-settings.service";

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
  fromDate: Date | null
) => {
  if (!fromDate) return undefined;

  if (!pullRequest.mergedAt) return undefined;

  return differenceInBusinessMilliseconds(fromDate, pullRequest.mergedAt);
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

export const getPullRequestLinesTracked = (
  workspace: Pick<Workspace, "settings">,
  pullRequest: Pick<PullRequest, "files">
) => {
  const settings = getWorkspaceSettings(workspace);
  const files = getPullRequestFiles(pullRequest);

  const filteredFiles = files.filter(
    (file) =>
      !micromatch.isMatch(file.path, settings.pullRequest.size.ignorePatterns)
  );

  const linesAddedCount = sum(filteredFiles, (file) => file.additions);
  const linesDeletedCount = sum(filteredFiles, (file) => file.deletions);

  return {
    changedFilesCount: filteredFiles.length,
    linesAddedCount,
    linesDeletedCount,
    linesChangedCount: linesAddedCount + linesDeletedCount,
  };
};

const getPullRequestFiles = (pullRequest: Pick<PullRequest, "files">) => {
  return pullRequest.files as unknown as PullRequestFile[];
};

export const getPullRequestSize = (
  workspace: Pick<Workspace, "settings">,
  linesChanged: number
) => {
  const settings = getWorkspaceSettings(workspace);

  if (linesChanged <= settings.pullRequest.size.tiny)
    return PullRequestSize.TINY;

  if (linesChanged <= settings.pullRequest.size.small)
    return PullRequestSize.SMALL;

  if (linesChanged <= settings.pullRequest.size.medium)
    return PullRequestSize.MEDIUM;

  if (linesChanged <= settings.pullRequest.size.large)
    return PullRequestSize.LARGE;

  return PullRequestSize.HUGE;
};
