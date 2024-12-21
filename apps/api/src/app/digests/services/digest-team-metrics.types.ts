export interface MetricLineElements {
  label: string;
  value: string;
  change: number;
}

export type DigestMetricType =
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
