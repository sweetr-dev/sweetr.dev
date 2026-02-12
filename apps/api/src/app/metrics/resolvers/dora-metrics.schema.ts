export default /* GraphQL */ `
  type Metrics {
    dora: DoraMetrics!
  }

  type DoraMetrics {
    leadTime(input: WorkspaceMetricInput!): LeadTimeMetric!
    changeFailureRate(input: WorkspaceMetricInput!): ChangeFailureRateMetric!
    deploymentFrequency(
      input: WorkspaceMetricInput!
    ): DeploymentFrequencyMetric!
    meanTimeToRecover(input: WorkspaceMetricInput!): MeanTimeToRecoverMetric!
  }

  input WorkspaceMetricInput {
    "The date range."
    dateRange: DateTimeRange!

    "The period to group by."
    period: Period!

    "The team ids to filter by."
    teamIds: [SweetID!]

    "The application ids to filter by."
    applicationIds: [SweetID!]

    "The environment ids to filter by."
    environmentIds: [SweetID!]

    "The repository ids to filter by."
    repositoryIds: [SweetID!]
  }

  type LeadTimeMetric {
    "The lead time in milliseconds for the current period"
    currentAmount: BigInt!

    "The date range for the current period"
    currentPeriod: DateTimeRangeValue!

    "The date range for the previous period"
    previousPeriod: DateTimeRangeValue!

    "The lead time in milliseconds before the current period"
    previousAmount: BigInt!

    "The change in lead time"
    change: Float!

    "The columns for the chart"
    columns: [DateTime!]!

    "The amounts over time for the chart"
    data: [BigInt!]!

    "Breakdown of lead time by development stages"
    breakdown: LeadTimeBreakdown!
  }

  type LeadTimeBreakdown {
    "Time spent coding (first commit to PR creation)"
    codingTime: BreakdownStage!

    "The date range for the current period"
    currentPeriod: DateTimeRangeValue!

    "The date range for the previous period"
    previousPeriod: DateTimeRangeValue!

    "Time waiting for first review"
    timeToFirstReview: BreakdownStage!

    "Time from first review to approval"
    timeToApprove: BreakdownStage!

    "Time from approval to merge"
    timeToMerge: BreakdownStage!

    "Time from merge to deploy"
    timeToDeploy: BreakdownStage!
  }

  type BreakdownStage {
    "Average time in milliseconds for current period"
    currentAmount: BigInt!

    "Average time in milliseconds for previous period"
    previousAmount: BigInt!

    "Percentage change from previous period"
    change: Float!
  }

  type ChangeFailureRateMetric {
    "The change failure rate for the current period"
    currentAmount: Float!

    "The date range for the current period"
    currentPeriod: DateTimeRangeValue!

    "The date range for the previous period"
    previousPeriod: DateTimeRangeValue!

    "The change failure rate before the current period"
    previousAmount: Float!

    "The change in change failure rate"
    change: Float!

    "The columns for the chart"
    columns: [DateTime!]!

    "The amounts over time for the chart"
    data: [Float!]!
  }

  type DeploymentFrequencyMetric {
    "The amount of deployments for the current period"
    currentAmount: BigInt!

    "The date range for the current period"
    currentPeriod: DateTimeRangeValue!

    "The date range for the previous period"
    previousPeriod: DateTimeRangeValue!

    "The average number of deployments per day"
    avg: Float!

    "The number of deployments before the current period"
    previousAmount: BigInt!

    "The change in the number of deployments"
    change: Float!

    "The columns for the chart"
    columns: [DateTime!]!

    "The amounts over time for the chart"
    data: [BigInt!]!
  }

  type MeanTimeToRecoverMetric {
    "The mean time to recover in milliseconds for the current period"
    currentAmount: BigInt!

    "The date range for the current period"
    currentPeriod: DateTimeRangeValue!

    "The date range for the previous period"
    previousPeriod: DateTimeRangeValue!

    "The mean time to recover in milliseconds before the current period"
    previousAmount: BigInt!

    "The change in mean time to recover"
    change: Float!

    "The columns for the chart"
    columns: [DateTime!]!

    "The amounts over time for the chart"
    data: [BigInt!]!
  }
`;
