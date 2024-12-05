import { Period } from "@sweetr/graphql-types/dist/api";

export interface PullRequestChartFilters {
  workspaceId: number;
  startDate: string;
  endDate: string;
  period: Period;
  teamId: number;
}
