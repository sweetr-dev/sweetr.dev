import { thirtyDaysAgo } from "../../../../lib/date";
import {
  CodeReviewEfficiencyInput,
  PullRequestFlowInput,
} from "../../../../graphql-types";
import { PullRequestFlowChartFilters } from "../../services/pr-flow.types";
import { CodeReviewEfficiencyChartFilters } from "../../services/chart-code-review-efficiency.types";

export const buildCommonChartFilters = (
  input: PullRequestFlowInput | CodeReviewEfficiencyInput,
  workspaceId: number
): PullRequestFlowChartFilters | CodeReviewEfficiencyChartFilters => ({
  workspaceId,
  startDate: input.dateRange.from ?? thirtyDaysAgo().toISOString(),
  endDate: input.dateRange.to ?? new Date().toISOString(),
  period: input.period,
  teamIds: input.teamIds ?? undefined,
  repositoryIds: input.repositoryIds ?? undefined,
});
