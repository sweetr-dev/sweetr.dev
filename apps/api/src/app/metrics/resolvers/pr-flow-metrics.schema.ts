export default /* GraphQL */ `
  extend type Metrics {
    prFlow: PullRequestFlowMetrics!
  }

  type PullRequestFlowMetrics {
    throughput(input: PullRequestFlowInput!): NumericSeriesChartData
    cycleTime(input: PullRequestFlowInput!): NumericChartData
    timeToMerge(input: PullRequestFlowInput!): NumericChartData
    timeToFirstReview(input: PullRequestFlowInput!): NumericChartData
    timeToApproval(input: PullRequestFlowInput!): NumericChartData
    pullRequestSizeDistribution(
      input: PullRequestFlowInput!
    ): PullRequestSizeDistributionChartData
    sizeCycleTimeCorrelation(
      input: PullRequestFlowInput!
    ): ScatterChartData
  }

  input PullRequestFlowInput {
    "The date range."
    dateRange: DateTimeRange!

    "The period to group by."
    period: Period!

    "The team ids to filter by."
    teamIds: [SweetID!]

    "The repository ids to filter by."
    repositoryIds: [SweetID!]
  }

  type PullRequestSizeDistributionChartData {
    columns: [DateTime!]!
    series: [ChartNumericSeries!]!
    averageLinesChanged: [Float!]!
  }

  type ScatterChartData {
    series: [ScatterChartSeries!]!
  }

  type ScatterChartSeries {
    name: String!
    color: HexColorCode
    data: [ScatterPoint!]!
  }

  type ScatterPoint {
    x: Float!
    y: Float!
    title: String
    url: String
  }
`;
