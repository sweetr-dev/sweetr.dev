export default /* GraphQL */ `
  extend type Metrics {
    prFlow: PullRequestFlowMetrics!
  }

  type PullRequestFlowMetrics {
    throughput(input: PullRequestFlowInput!): NumericSeriesChartData
    cycleTime(input: PullRequestFlowInput!): NumericChartData
    timeToCode(input: PullRequestFlowInput!): NumericChartData
    timeToMerge(input: PullRequestFlowInput!): NumericChartData
    timeToFirstReview(input: PullRequestFlowInput!): NumericChartData
    timeToApproval(input: PullRequestFlowInput!): NumericChartData
    cycleTimeBreakdown(input: PullRequestFlowInput!): CycleTimeBreakdownChartData
    pullRequestSizeDistribution(
      input: PullRequestFlowInput!
    ): PullRequestSizeDistributionChartData
    sizeCycleTimeCorrelation(
      input: PullRequestFlowInput!
    ): ScatterChartData
    teamOverview(input: PullRequestFlowInput!): [TeamPrFlowOverviewRow!]
    codeReviewDistribution(input: PullRequestFlowInput!): CodeReviewDistributionChartData
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

  type TeamPrFlowOverviewRow {
    teamId: SweetID
    teamName: String!
    teamIcon: String!
    medianCycleTime: BigInt!
    mergedCount: Int!
    avgLinesChanged: Float!
    pctBigPrs: Float!
  }

  type CycleTimeBreakdownChartData {
    columns: [DateTime!]!
    cycleTime: [BigInt!]!
    timeToCode: [BigInt!]!
    timeToFirstReview: [BigInt!]!
    timeToApproval: [BigInt!]!
    timeToMerge: [BigInt!]!
  }
`;
