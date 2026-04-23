export default /* GraphQL */ `
  extend type Metrics {
    codeReviewEfficiency: CodeReviewEfficiencyMetrics!
  }

  type CodeReviewEfficiencyMetrics {
    reviewTurnaroundTime(input: CodeReviewEfficiencyInput!): NumericChartData
    timeToApproval(input: CodeReviewEfficiencyInput!): NumericChartData
    sizeCommentCorrelation(input: CodeReviewEfficiencyInput!): ScatterChartData
    codeReviewDistribution(
      input: CodeReviewEfficiencyInput!
    ): CodeReviewDistributionChartData
    teamOverview(
      input: CodeReviewEfficiencyInput!
    ): [CodeReviewTeamOverviewRow!]
    kpi(input: CodeReviewEfficiencyInput!): CodeReviewEfficiencyKpi!
  }

  type CodeReviewEfficiencyKpi {
    timeToFirstReview: CodeReviewDurationKpi!
    timeToApproval: CodeReviewDurationKpi!
    avgCommentsPerPr: CodeReviewFloatKpi!
    prsWithoutApproval: CodeReviewCountKpi!
  }

  input CodeReviewEfficiencyInput {
    "The date range."
    dateRange: DateTimeRange!

    "The period to group by."
    period: Period!

    "The team ids to filter by."
    teamIds: [SweetID!]

    "The repository ids to filter by."
    repositoryIds: [SweetID!]
  }

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

  type GraphChartLink {
    source: String!
    target: String!
    value: Int!
    isFromTeam: Boolean!
  }

  type CodeReviewDurationKpi {
    currentAmount: BigInt!
    previousAmount: BigInt!
    change: Int!
    currentPeriod: DateTimeRangeValue!
    previousPeriod: DateTimeRangeValue!
  }

  type CodeReviewCountKpi {
    currentAmount: Int!
    previousAmount: Int!
    change: Int!
    currentPeriod: DateTimeRangeValue!
    previousPeriod: DateTimeRangeValue!
  }

  type CodeReviewFloatKpi {
    currentAmount: Float!
    previousAmount: Float!
    change: Int!
    currentPeriod: DateTimeRangeValue!
    previousPeriod: DateTimeRangeValue!
  }

  type CodeReviewTeamOverviewRow {
    teamId: SweetID
    teamName: String!
    teamIcon: String!
    avgTimeToFirstReview: BigInt!
    avgTimeToApproval: BigInt!
    prsWithoutApproval: Int!
  }
`;
