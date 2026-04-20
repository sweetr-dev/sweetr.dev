import { thirtyDaysAgo } from "../../../../lib/date";
import { PullRequestFlowInput } from "../../../../graphql-types";
import { PullRequestFlowChartFilters } from "../../services/pr-flow.types";

export const buildPullRequestFlowChartFilters = (
  input: PullRequestFlowInput,
  workspaceId: number
): PullRequestFlowChartFilters => ({
  workspaceId,
  startDate: input.dateRange.from ?? thirtyDaysAgo().toISOString(),
  endDate: input.dateRange.to ?? new Date().toISOString(),
  period: input.period,
  teamIds: input.teamIds ?? undefined,
  repositoryIds: input.repositoryIds ?? undefined,
});
