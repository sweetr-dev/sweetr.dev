export interface MetricLineElements {
  label: string;
  value: string;
  change: number;
}

export type TeamMetricType =
  | "timeToMerge"
  | "timeForFirstReview"
  | "timeForApproval"
  | "cycleTime"
  | "avgPrSize";

export interface TeamMetric {
  current: bigint;
  previous: bigint;
  change: number;
}
