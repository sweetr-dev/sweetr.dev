import { differenceInDays, subWeeks } from "date-fns";
import { createFieldResolver } from "../../../../lib/graphql";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import { getTeamWorkLog } from "../../services/work-log.service";
import { UTCDate } from "@date-fns/utc";
import { transformActivityEvent } from "../transformers/activity-event.transformer";
import { InputValidationException } from "../../../errors/exceptions/input-validation.exception";

export const teamsQuery = createFieldResolver("Team", {
  workLog: async (team, { input }, { workspaceId }) => {
    if (!workspaceId) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    if (!team.id) {
      throw new ResourceNotFoundException("Team not found");
    }

    const from = input.dateRange.from
      ? new Date(input.dateRange.from)
      : subWeeks(new UTCDate(), 1);

    const to = input.dateRange.to
      ? new Date(input.dateRange.to)
      : new UTCDate();

    if (differenceInDays(to, from) > 30) {
      throw new InputValidationException(
        "Date range cannot be greater than 30 days"
      );
    }

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
