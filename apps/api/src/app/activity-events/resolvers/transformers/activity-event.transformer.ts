import { ActivityEventType } from "@prisma/client";
import {
  ActivityEvent,
  CodeReview,
  PullRequest,
} from "../../../../graphql-types";
import { transformCodeReview } from "../../../code-reviews/resolvers/transformers/code-review.transformer";
import { transformPullRequest } from "../../../pull-requests/resolvers/transformers/pull-request.transformer";
import {
  ActivityEventData,
  isCodeReviewActivityEvent,
} from "../../services/activity-events.types";
import { isPullRequestActivityEvent } from "../../services/activity-events.types";
import { InputValidationException } from "../../../errors/exceptions/input-validation.exception";

export const transformActivityEvent = (
  data: ActivityEventData
): ActivityEvent => {
  if (isCodeReviewActivityEvent(data)) {
    return {
      ...data,
      eventAt: data.eventAt.toISOString(),
      __typename: "CodeReviewSubmittedEvent",
      codeReview: transformCodeReview(data.codeReview) as CodeReview,
    };
  }

  if (isPullRequestActivityEvent(data)) {
    return {
      ...data,
      __typename:
        data.type === ActivityEventType.PULL_REQUEST_CREATED
          ? "PullRequestCreatedEvent"
          : "PullRequestMergedEvent",
      eventAt: data.eventAt.toISOString(),
      pullRequest: transformPullRequest(data.pullRequest) as PullRequest,
    };
  }

  throw new InputValidationException("Unknown activity event type", {
    extra: {
      data,
    },
  });
};
