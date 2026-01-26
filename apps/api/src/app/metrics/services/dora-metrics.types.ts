import { Prisma } from "@prisma/client";
import { Period } from "../../../graphql-types";
import { DateTimeRange } from "../../types";

export interface DoraMetricsFilters {
  workspaceId: number;
  dateRange: Required<DateTimeRange>;
  period: Period;
  teamIds?: number[];
  applicationIds?: number[];
  environmentIds?: number[];
  repositoryIds?: number[];
}

export interface DeploymentFiltersResult {
  joins: Prisma.Sql[];
  conditions: Prisma.Sql[];
}

export interface AggregateQueryArgs {
  filters: DoraMetricsFilters;
  from: string;
  to: string;
}

export interface MetricResult {
  columns: string[];
  data: bigint[];
  currentAmount: bigint;
  previousAmount: bigint;
  change: number;
  currentPeriod: { from: string; to: string };
  previousPeriod: { from: string; to: string };
}

export interface FailureRateResult
  extends Pick<
    MetricResult,
    "columns" | "data" | "change" | "currentPeriod" | "previousPeriod"
  > {
  currentAmount: number;
  previousAmount: number;
}

export interface DeploymentFrequencyResult extends MetricResult {
  avg: number;
}
