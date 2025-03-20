import { getPrisma, jsonObject } from "../../../prisma";
import { eachDayOfInterval } from "date-fns";
import { ActivityEventType } from "@prisma/client";
import {
  ActivityEventCodeReviewSubmitedMetadata,
  ActivityEventData,
  GetTeamWorkLogArgs,
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

  return {
    columns: columns.map((column) => column.toISOString()),
    data,
  };
};
