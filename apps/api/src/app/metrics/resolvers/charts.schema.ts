export default /* GraphQL */ `
  enum Period {
    DAILY
    WEEKLY
    MONTHLY
    QUARTERLY
    YEARLY
  }

  extend type Workspace {
    charts(input: ChartInput!): Charts
  }

  type Charts {
    pullRequestSizeDistribution: NumericSeriesChartData
    timeToMerge: NumericChartData
    timeForFirstReview: NumericChartData
    timeForApproval: NumericChartData
    cycleTime: NumericChartData
    codeReviewDistribution: CodeReviewDistributionChartData
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

  input ChartInput {
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
