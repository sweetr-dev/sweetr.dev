export default /* GraphQL */ `
  type TeamWorkLogResponse {
    columns: [DateTime!]!
    data: [WorkLogData!]!
  }

  type WorkLogData {
    codeReviews: [CodeReview!]!
    createdPullRequests: [PullRequest!]!
    mergedPullRequests: [PullRequest!]!
  }

  input TeamWorkLogInput {
    "The date range."
    dateRange: DateTimeRange!
  }

  extend type Team {
    workLog(input: TeamWorkLogInput!): TeamWorkLogResponse!
  }
`;
