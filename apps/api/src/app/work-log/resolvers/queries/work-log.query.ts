import { subWeeks } from "date-fns";
import { createFieldResolver } from "../../../../lib/graphql";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import { getTeamWorkLog } from "../../services/work-log.service";
import { UTCDate } from "@date-fns/utc";
import { parseNullableISO } from "../../../../lib/date";
import { transformCodeReview } from "../../../code-reviews/resolvers/transformers/code-review.transformer";
import { transformPullRequest } from "../../../pull-requests/resolvers/transformers/pull-request.transformer";

export const teamsQuery = createFieldResolver("Team", {
  workLog: async (team, { input }, { workspaceId }) => {
    if (!workspaceId) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    if (!team.id) {
      throw new ResourceNotFoundException("Team not found");
    }

    console.log("input is", input.dateRange.from, input.dateRange.to);

    const from = new Date(input.dateRange.from!) || subWeeks(new UTCDate(), 1);
    const to = new Date(input.dateRange.to!) || new UTCDate();

    const workLog = await getTeamWorkLog({
      workspaceId,
      teamId: team.id,
      startDate: from,
      endDate: to,
    });

    return {
      columns: workLog.columns,
      data: workLog.data.map((data) => ({
        codeReviews: data.codeReviews.map(transformCodeReview),
        createdPullRequests: data.createdPullRequests.map(transformPullRequest),
        mergedPullRequests: data.mergedPullRequests.map(transformPullRequest),
      })),
    };
  },
});
