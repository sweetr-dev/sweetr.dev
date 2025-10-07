export default /* GraphQL */ `
  enum PullRequestState {
    DRAFT
    OPEN
    CLOSED
    MERGED
  }

  enum PullRequestOwnerType {
    TEAM
    PERSON
  }

  enum PullRequestSize {
    TINY
    SMALL
    MEDIUM
    LARGE
    HUGE
  }

  type PullRequest {
    id: SweetID!

    "The title"
    title: String!

    "The external git url"
    gitUrl: String!

    "The amount of comments"
    commentCount: Int!

    "The amount of files changed"
    changedFilesCount: Int!

    "The amount of lines added"
    linesAddedCount: Int!

    "The amount of lines deleted"
    linesDeletedCount: Int!

    "The state of the pull request"
    state: PullRequestState!

    "The time when the pull request was created"
    createdAt: DateTime!

    "The time when the pull request was merged"
    mergedAt: DateTime

    "The time when the pull request was closed"
    closedAt: DateTime

    "The author"
    author: Person!

    "The repository"
    repository: Repository!

    "The tracking information"
    tracking: PullRequestTracking!
  }

  type PullRequestTracking {
    "The size of the pull request"
    size: PullRequestSize!

    "The amount of files changed (ignores auto-generated files)"
    changedFilesCount: Int!

    "The amount of lines added (ignores auto-generated files)"
    linesAddedCount: Int!

    "The amount of lines deleted (ignores auto-generated files)"
    linesDeletedCount: Int!

    "The time when the pull request received its first review"
    firstReviewAt: DateTime

    "The time when the pull request received its first approval"
    firstApprovalAt: DateTime

    "The duration, in milliseconds, between the time the first reviewer was requested and the time it received its first review"
    timeToFirstReview: BigInt

    "The duration, in milliseconds, between the time the first reviewer was requested and the time it received its first approval"
    timeToFirstApproval: BigInt

    "The duration, in milliseconds, between the first approval of the Pull Request and the time it received it was merged. Compares with creation date when merged without reviews"
    timeToMerge: BigInt
  }

  input PullRequestsQueryInput {
    "The pagination cursor"
    cursor: SweetID

    "The ids to filter by"
    ownerIds: [SweetID!]!

    "Whether the ids refer to teams or people"
    ownerType: PullRequestOwnerType!

    "The time range the pull request was created in"
    createdAt: DateTimeRange

    "The time range the pull request was merged or closed"
    finalizedAt: DateTimeRange

    "The state to filter by"
    states: [PullRequestState!]

    "The size to filter by"
    sizes: [PullRequestSize!]
  }

  type PullRequestsInProgressResponse {
    drafted: [PullRequest!]!
    pendingReview: [PullRequest!]!
    changesRequested: [PullRequest!]!
    pendingMerge: [PullRequest!]!
  }

  extend type Workspace {
    pullRequests(input: PullRequestsQueryInput!): [PullRequest!]!
  }

  extend type Team {
    pullRequestsInProgress: PullRequestsInProgressResponse!
  }

  extend type CodeReview {
    pullRequest: PullRequest!
  }

  extend type Deployment {
    "The amount of pull requests that were deployed"
    pullRequestCount: Int!

    "The pull requests that were deployed"
    pullRequests: [PullRequest!]!
  }
`;
