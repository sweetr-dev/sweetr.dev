export default /* GraphQL */ `
  extend type Metrics {
    pullRequestSizeDistribution(input: TeamMetricInput!): NumericSeriesChartData
    timeToMerge(input: TeamMetricInput!): NumericChartData
    timeForFirstReview(input: TeamMetricInput!): NumericChartData
    timeForApproval(input: TeamMetricInput!): NumericChartData
    cycleTime(input: TeamMetricInput!): NumericChartData
    codeReviewDistribution(
      input: TeamMetricInput!
    ): CodeReviewDistributionChartData
  }

  # ----------------------------------------------------------------------------------

  type NumericChartData {
    columns: [DateTime!]!
    data: [BigInt!]!
  }

  # ----------------------------------------------------------------------------------

  type NumericSeriesChartData {
    columns: [DateTime!]!
    series: [ChartNumericSeries!]!
  }

  type ChartNumericSeries {
    name: String!
    data: [BigInt!]!
    color: HexColorCode
  }

  # ----------------------------------------------------------------------------------

  type CodeReviewDistributionChartData {
    entities: [CodeReviewDistributionEntity!]!
    links: [GraphChartLink!]!
    totalReviews: Int!
  }

  type CodeReviewDistributionEntity {
    id: String!
    name: String!
    image: String
    reviewCount: Int
    reviewSharePercentage: Float
  }

  # ----------------------------------------------------------------------------------

  type GraphChartLink {
    source: String!
    target: String!
    value: Int!
  }

  input TeamMetricInput {
    "The date range."
    dateRange: DateTimeRange!

    "The period to group by."
    period: Period!

    "The team id to filter by."
    teamId: SweetID!
  }

  input PullRequestTrendInput {
    state: PullRequestState
  }
`;
