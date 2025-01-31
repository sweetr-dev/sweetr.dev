import { Period } from "../../../graphql-types";

export interface PullRequestChartFilters {
  workspaceId: number;
  startDate: string;
  endDate: string;
  period: Period;
  teamId: number;
}
