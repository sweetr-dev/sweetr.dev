export interface MetricLineElements {
  label: string;
  value: string;
  change: number;
}

export type DigestMetricType =
  | "prCount"
  | "timeToMerge"
  | "timeForFirstReview"
  | "timeForApproval"
  | "cycleTime"
  | "pullRequestSize";

export interface TeamMetric {
  current: bigint;
  previous: bigint;
  change: number;
}
