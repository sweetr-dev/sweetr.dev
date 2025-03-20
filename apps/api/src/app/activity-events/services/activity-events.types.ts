import { CodeReview, PullRequest } from "@prisma/client";

export type ActivityEventCodeReviewSubmitedMetadata = Pick<
  CodeReview,
  "state" | "commentCount"
>;

export type ActivityEventData =
  | PullRequestActivityEvent
  | CodeReviewActivityEvent;

export interface PullRequestActivityEvent {
  type: "PULL_REQUEST_CREATED" | "PULL_REQUEST_MERGED";
  eventAt: Date;
  pullRequest: PullRequest;
}

export interface CodeReviewActivityEvent {
  type: "CODE_REVIEW_SUBMITTED";
  eventAt: Date;
  codeReview: CodeReview;
}

export interface GetTeamWorkLogArgs {
  workspaceId: number;
  teamId: number;
  startDate: Date;
  endDate: Date;
}

export const isCodeReviewActivityEvent = (
  activityEvent: ActivityEventData
): activityEvent is CodeReviewActivityEvent => {
  return (
    activityEvent &&
    activityEvent.type === "CODE_REVIEW_SUBMITTED" &&
    "codeReview" in activityEvent
  );
};

export const isPullRequestActivityEvent = (
  activityEvent: ActivityEventData
): activityEvent is PullRequestActivityEvent => {
  return (
    activityEvent &&
    (activityEvent.type === "PULL_REQUEST_CREATED" ||
      activityEvent.type === "PULL_REQUEST_MERGED") &&
    "pullRequest" in activityEvent
  );
};
