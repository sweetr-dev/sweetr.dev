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
    "The lead time for the current period"
    currentAmount: Int!

    "The lead time before the current period"
    previousAmount: Int!

    "The change in lead time"
    change: Float!

    "The columns for the chart"
    columns: [DateTime!]!

    "The amounts over time for the chart"
    data: [BigInt!]!
  }

  type ChangeFailureRateMetric {
    "The change failure rate for the current period"
    currentAmount: Float!

    "The change failure rate before the current period"
    previousAmount: Float!

    "The change in change failure rate"
    change: Float!

    "The columns for the chart"
    columns: [DateTime!]!

    "The amounts over time for the chart"
    data: [BigInt!]!
  }

  type DeploymentFrequencyMetric {
    "The amount of deployments for the current period"
    currentAmount: Int!

    "The average number of deployments per day"
    avg: Float!

    "The number of deployments before the current period"
    previousAmount: Int!

    "The change in the number of deployments"
    change: Float!

    "The columns for the chart"
    columns: [DateTime!]!

    "The amounts over time for the chart"
    data: [BigInt!]!
  }

  type MeanTimeToRecoverMetric {
    "The mean time to recover in milliseconds for the current period"
    currentAmount: Int!

    "The mean time to recover in milliseconds before the current period"
    previousAmount: Int!

    "The change in mean time to recover"
    change: Float!

    "The columns for the chart"
    columns: [DateTime!]!

    "The amounts over time for the chart"
    data: [BigInt!]!
  }
`;
