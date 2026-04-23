import { Prisma } from "@prisma/client";
import { Period } from "../../../graphql-types";

export interface CodeReviewEfficiencyChartFilters {
  workspaceId: number;
  startDate: string;
  endDate: string;
  period: Period;
  teamIds?: number[];
  repositoryIds?: number[];
}

export type CodeReviewDistributionRow = {
  source: string;
  target: string;
  value: number;
  isTargetFromTeam: boolean;
  crAuthorName: string;
  crAuthorAvatar?: string;
  prAuthorName: string;
  prAuthorAvatar?: string;
};

export type CodeReviewLink = {
  source: string;
  target: string;
  value: number;
  isFromTeam: boolean;
};

export interface CodeReviewEfficiencyFiltersResult {
  joins: Prisma.Sql[];
  conditions: Prisma.Sql[];
}

export interface CodeReviewKpiResult {
  currentAmount: bigint;
  previousAmount: bigint;
  change: number;
  currentPeriod: { from: string; to: string };
  previousPeriod: { from: string; to: string };
}

export interface CodeReviewCountKpiResult {
  currentAmount: number;
  previousAmount: number;
  change: number;
  currentPeriod: { from: string; to: string };
  previousPeriod: { from: string; to: string };
}

export interface AvgCommentsKpiResult {
  currentAmount: number;
  previousAmount: number;
  change: number;
  currentPeriod: { from: string; to: string };
  previousPeriod: { from: string; to: string };
}

export interface CodeReviewTeamOverviewRow {
  team_id: number | null;
  team_name: string;
  team_icon: string;
  avg_time_to_first_review: number;
  avg_time_to_approval: number;
  prs_without_approval: bigint;
}
