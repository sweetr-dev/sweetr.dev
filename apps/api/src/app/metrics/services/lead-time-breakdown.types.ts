import { Prisma } from "@prisma/client";
import { DoraMetricsFilters } from "./dora-metrics.types";

export interface StageResult {
  currentAmount: bigint;
  previousAmount: bigint;
  change: number;
}

export interface LeadTimeBreakdownResult {
  codingTime: StageResult;
  timeToFirstReview: StageResult;
  timeToApprove: StageResult;
  timeToMerge: StageResult;
  timeToDeploy: StageResult;
  currentPeriod: { from: string; to: string };
  previousPeriod: { from: string; to: string };
}

export type GetLeadTimeBreakdownArgs = DoraMetricsFilters;

export interface BreakdownRow {
  timeToCode: number | null;
  timeToFirstReview: number | null;
  timeToFirstApproval: number | null;
  timeToMerge: number | null;
  timeToDeploy: number | null;
}

export interface BreakdownAggregateQueryArgs {
  args: GetLeadTimeBreakdownArgs;
  from: string;
  to: string;
}

export interface DeploymentFilters {
  joins: Prisma.Sql[];
  conditions: Prisma.Sql[];
}
