import { Prisma } from "@prisma/client";
import { Period } from "../../../graphql-types";

export interface PullRequestFlowChartFilters {
  workspaceId: number;
  startDate: string;
  endDate: string;
  period: Period;
  teamIds?: number[];
  repositoryIds?: number[];
}

export interface PullRequestFiltersResult {
  joins: Prisma.Sql[];
  conditions: Prisma.Sql[];
}

export interface CycleTimeBreakdownRow {
  period: Date;
  cycle_time: number;
  time_to_code: number;
  time_to_first_review: number;
  time_to_approval: number;
  time_to_merge: number;
}

export interface CycleTimeBreakdownResult {
  period: string;
  cycleTime: bigint;
  timeToCode: bigint;
  timeToFirstReview: bigint;
  timeToApproval: bigint;
  timeToMerge: bigint;
}

export interface TeamOverviewRow {
  team_id: number | null;
  team_name: string;
  team_icon: string;
  median_cycle_time: number;
  merged_count: bigint;
  avg_lines_changed: number;
  pct_big_prs: number;
}
