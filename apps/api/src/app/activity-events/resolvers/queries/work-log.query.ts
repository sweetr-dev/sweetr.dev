import { subWeeks } from "date-fns";
import { createFieldResolver } from "../../../../lib/graphql";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import { getTeamWorkLog } from "../../services/work-log.service";
import { UTCDate } from "@date-fns/utc";
import { transformActivityEvent } from "../transformers/activity-event.transformer";

export const teamsQuery = createFieldResolver("Team", {
  workLog: async (team, { input }, { workspaceId }) => {
    if (!workspaceId) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    if (!team.id) {
      throw new ResourceNotFoundException("Team not found");
    }

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
      data: workLog.data.map((data) => transformActivityEvent(data)),
    };
  },
});
