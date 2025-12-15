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
    amount: Int!

    "The lead time before the current period"
    before: Int!

    "The change in lead time"
    change: Int!

    columns: [DateTime!]!
    data: [BigInt!]!
  }

  type ChangeFailureRateMetric {
    "The change failure rate for the current period"
    amount: Float!

    "The change failure rate before the current period"
    before: Float!

    "The change in change failure rate"
    change: Int!

    columns: [DateTime!]!
    data: [BigInt!]!
  }

  type DeploymentFrequencyMetric {
    "The amount of deployments for the current period"
    amount: Int!

    "The average number of deployments per day"
    avg: Float!

    "The number of deployments before the current period"
    before: Int!

    "The change in the number of deployments"
    change: Int!

    columns: [DateTime!]!
    data: [BigInt!]!
  }

  type MeanTimeToRecoverMetric {
    "The mean time to recover in milliseconds for the current period"
    amount: Int!

    "The mean time to recover in milliseconds before the current period"
    before: Int!

    "The change in mean time to recover"
    change: Int!

    columns: [DateTime!]!
    data: [BigInt!]!
  }
`;
