export default /* GraphQL */ `
  type TeamWorkLogResponse {
    columns: [DateTime!]!
    data: [ActivityEvent!]!
  }

  enum ActivityEventType {
    CODE_REVIEW_SUBMITTED
    PULL_REQUEST_CREATED
    PULL_REQUEST_MERGED
  }

  union ActivityEvent =
    | CodeReviewSubmittedEvent
    | PullRequestCreatedEvent
    | PullRequestMergedEvent

  type CodeReviewSubmittedEvent {
    eventAt: DateTime!
    codeReview: CodeReview!
  }

  type PullRequestCreatedEvent {
    eventAt: DateTime!
    pullRequest: PullRequest!
  }

  type PullRequestMergedEvent {
    eventAt: DateTime!
    pullRequest: PullRequest!
  }

  input TeamWorkLogInput {
    "The date range."
    dateRange: DateTimeRange!
  }

  extend type Team {
    workLog(input: TeamWorkLogInput!): TeamWorkLogResponse!
  }
`;
