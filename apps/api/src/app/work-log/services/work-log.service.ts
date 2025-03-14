import { getPrisma, jsonObject } from "../../../prisma";
import { getDateYmd } from "../../../lib/date";
import { eachDayOfInterval } from "date-fns";
import { UTCDate } from "@date-fns/utc";
import { ActivityEventType } from "@prisma/client";
import { GetTeamWorkLogArgs, WorkLogData } from "./work-log.types";
import { ActivityEventCodeReviewSubmitedMetadata } from "../../activity-events/services/activity-events.types";
import { captureException } from "../../../lib/sentry";
import { InputValidationException } from "../../errors/exceptions/input-validation.exception";

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
    start: new UTCDate(startDate),
    end: new UTCDate(endDate),
  });

  const data: WorkLogData[] = columns.map(() => {
    return {
      codeReviews: [],
      createdPullRequests: [],
      mergedPullRequests: [],
    };
  });

  console.log("data is", data);
  console.log("columns is", columns);

  for (const event of activityEvents) {
    const date = getDateYmd(event.eventAt);
    const index = columns.findIndex((column) => getDateYmd(column) === date);

    console.log(`for event ${event.id} index is`, index);

    if (index === -1) {
      captureException(
        new InputValidationException(
          `Event ${event.id} has no corresponding date in the columns`,
          { extra: { columns, data, workspaceId, teamId, startDate, endDate } }
        )
      );
      continue;
    }

    if (!event.pullRequestId || !event.pullRequest) continue;

    if (event.type === ActivityEventType.CODE_REVIEW_SUBMITTED) {
      const metadata = jsonObject<ActivityEventCodeReviewSubmitedMetadata>(
        event.metadata
      );

      data[index].codeReviews.push({
        id: event.id,
        state: metadata.state,
        commentCount: metadata.commentCount,
        createdAt: event.eventAt,
        pullRequestId: event.pullRequestId,
        authorId: event.gitProfileId,
        workspaceId: workspaceId,
        updatedAt: event.eventAt,
      });

      continue;
    }

    if (event.type === ActivityEventType.PULL_REQUEST_CREATED) {
      data[index].createdPullRequests.push(event.pullRequest);
      continue;
    }

    if (event.type === ActivityEventType.PULL_REQUEST_MERGED) {
      data[index].mergedPullRequests.push(event.pullRequest);
      continue;
    }
  }

  return {
    columns: columns.map((column) => column.toISOString()),
    data,
  };
};
