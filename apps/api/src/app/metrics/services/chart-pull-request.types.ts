import { Period } from "../../../graphql-types";

export interface PullRequestChartFilters {
  workspaceId: number;
  startDate: string;
  endDate: string;
  period: Period;
  teamId: number;
}

export interface PullRequestFlowChartFilters {
  workspaceId: number;
  startDate: string;
  endDate: string;
  period: Period;
  teamIds?: number[];
  repositoryIds?: number[];
}
