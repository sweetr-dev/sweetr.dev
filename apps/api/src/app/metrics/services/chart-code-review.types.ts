import { Period } from "@sweetr/graphql-types/dist/api";

export interface CodeReviewChartFilters {
  workspaceId: number;
  startDate: string;
  endDate: string;
  period: Period;
  teamId: number;
}

export type CodeReviewDistributionRow = {
  source: string;
  target: string;
  value: number;
  isTargetFromTeam: number;
  crAuthorName: string;
  crAuthorAvatar?: string;
  prAuthorName: string;
  prAuthorAvatar?: string;
};

export type CodeReviewLink = {
  source: string;
  target: string;
  value: number;
};
