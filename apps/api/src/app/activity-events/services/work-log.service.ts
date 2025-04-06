import { getPrisma, jsonObject } from "../../../prisma";
import { eachDayOfInterval } from "date-fns";
import { ActivityEventType } from "@prisma/client";
import {
  ActivityEventCodeReviewSubmitedMetadata,
  ActivityEventData,
  GetTeamWorkLogArgs,
  isCodeReviewActivityEvent,
  CodeReviewActivityEvent,
} from "../services/activity-events.types";
import { CodeReviewState } from "../../../graphql-types";

export const getTeamWorkLog = async ({
  workspaceId,
  teamId,
  startDate,
  endDate,
}: GetTeamWorkLogArgs) => {
  const teamMembers = await getPrisma(workspaceId).teamMember.findMany({
    where: {
      teamId,
    },
  });

  const activityEvents = await getPrisma(workspaceId).activityEvent.findMany({
    where: {
      gitProfileId: {
        in: teamMembers.map((teamMember) => teamMember.gitProfileId),
      },
      eventAt: {
        gte: startDate,
        lte: endDate,
      },
      type: {
        in: [
          ActivityEventType.CODE_REVIEW_SUBMITTED,
          ActivityEventType.PULL_REQUEST_CREATED,
          ActivityEventType.PULL_REQUEST_MERGED,
        ],
      },
    },
    include: {
      gitProfile: true,
      pullRequest: {
        include: {
          author: true,
        },
      },
    },
  });

  const columns = eachDayOfInterval({
    start: new Date(startDate),
    end: new Date(endDate),
  });

  const data: ActivityEventData[] = [];

  for (const event of activityEvents) {
    if (!event.pullRequestId || !event.pullRequest) continue;

    if (event.type === ActivityEventType.CODE_REVIEW_SUBMITTED) {
      const metadata = jsonObject<ActivityEventCodeReviewSubmitedMetadata>(
        event.metadata
      );

      data.push({
        type: ActivityEventType.CODE_REVIEW_SUBMITTED,
        eventAt: event.eventAt,
        codeReview: {
          // Mimic CodeReview type from event metadata
          id: event.id,
          state: metadata.state as CodeReviewState,
          commentCount: metadata.commentCount,
          createdAt: event.eventAt,
          pullRequestId: event.pullRequestId,
          authorId: event.gitProfileId,
          workspaceId: workspaceId,
          updatedAt: event.eventAt,
        },
      });

      continue;
    }

    data.push({
      type: event.type,
      eventAt: event.eventAt,
      pullRequest: event.pullRequest,
    });
  }

  const activities = groupSerialReviews(data);

  return {
    columns: columns.map((column) => column.toISOString()),
    data: activities,
  };
};

export const REVIEW_GROUPING_WINDOW_MINS = 45;

export const groupSerialReviews = (data: ActivityEventData[]) => {
  // Sort events by timestamp to make grouping easier
  const sortedEvents = [...data].sort(
    (a, b) => a.eventAt.getTime() - b.eventAt.getTime()
  );

  // Create a new array of same length as input
  const mappedEvents: (ActivityEventData | null)[] = new Array(
    sortedEvents.length
  );

  // Map to track reviews by PR and author within the time window
  type ReviewKey = `${number}-${number}`; // PR ID and author ID
  const reviewsInWindow = new Map<
    ReviewKey,
    {
      firstEvent: CodeReviewActivityEvent;
      totalComments: number;
      firstEventTime: number;
      firstEventIndex: number;
      state: CodeReviewState;
    }
  >();

  for (let i = 0; i < sortedEvents.length; i++) {
    const event = sortedEvents[i];

    if (!isCodeReviewActivityEvent(event)) {
      mappedEvents[i] = event;
      continue;
    }

    const key: ReviewKey = `${event.codeReview.pullRequestId}-${event.codeReview.authorId}`;
    const eventTime = event.eventAt.getTime();

    const existingReview = reviewsInWindow.get(key);

    if (!existingReview) {
      reviewsInWindow.set(key, {
        firstEvent: event,
        totalComments: event.codeReview.commentCount,
        firstEventTime: eventTime,
        firstEventIndex: i,
        state: event.codeReview.state as CodeReviewState,
      });
      continue;
    }

    // If this event is within the time window of the first review
    if (
      eventTime - existingReview.firstEventTime <=
      REVIEW_GROUPING_WINDOW_MINS * 60 * 1000
    ) {
      // Update the existing review with new comments
      existingReview.totalComments += event.codeReview.commentCount;
      existingReview.state = event.codeReview.state as CodeReviewState;
      mappedEvents[i] = null;
      continue;
    }

    // This event is outside the window, so add the existing review to results
    mappedEvents[existingReview.firstEventIndex] = {
      ...existingReview.firstEvent,
      codeReview: {
        ...existingReview.firstEvent.codeReview,
        commentCount: existingReview.totalComments,
      },
    };

    // Start a new window with this event
    reviewsInWindow.set(key, {
      firstEvent: event,
      totalComments: event.codeReview.commentCount,
      firstEventTime: eventTime,
      firstEventIndex: i,
      state: event.codeReview.state as CodeReviewState,
    });
  }

  // Add any remaining reviews in the window to the results
  for (const review of reviewsInWindow.values()) {
    mappedEvents[review.firstEventIndex] = {
      ...review.firstEvent,
      codeReview: {
        ...review.firstEvent.codeReview,
        commentCount: review.totalComments,
        state: review.state,
      },
    };
  }

  return mappedEvents.filter(
    (event): event is ActivityEventData => event !== null
  );
};
