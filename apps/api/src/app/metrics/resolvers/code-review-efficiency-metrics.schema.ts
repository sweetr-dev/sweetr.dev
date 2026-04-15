export default /* GraphQL */ `
  extend type Metrics {
    codeReviewEfficiency: CodeReviewEfficiencyMetrics!
  }

  type CodeReviewEfficiencyMetrics {
    reviewTurnaroundTime(input: PullRequestFlowInput!): NumericChartData
    timeToApproval(input: PullRequestFlowInput!): NumericChartData
    prsWithoutApproval(input: PullRequestFlowInput!): Int
    sizeCommentCorrelation(input: PullRequestFlowInput!): ScatterChartData
    codeReviewDistribution(input: PullRequestFlowInput!): CodeReviewDistributionChartData
    teamOverview(input: PullRequestFlowInput!): [CodeReviewTeamOverviewRow!]
    kpiTimeToFirstReview(input: PullRequestFlowInput!): CodeReviewDurationKpi
    kpiTimeToApproval(input: PullRequestFlowInput!): CodeReviewDurationKpi
    kpiAvgCommentsPerPr(input: PullRequestFlowInput!): CodeReviewFloatKpi
    kpiPrsWithoutApproval(input: PullRequestFlowInput!): CodeReviewCountKpi
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
