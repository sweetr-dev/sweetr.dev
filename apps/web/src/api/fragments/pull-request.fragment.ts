import { graphql } from "@sweetr/graphql-types/frontend";

export const PULL_REQUEST_FRAGMENT = graphql(/* GraphQL */ `
  fragment PullRequestTest on PullRequest {
    id
    title
    gitUrl
    commentCount
    changedFilesCount
    linesAddedCount
    linesDeletedCount
    state
    createdAt
    mergedAt
    closedAt
    tracking {
      size
      changedFilesCount
      linesAddedCount
      linesDeletedCount
      timeToFirstReview
      timeToMerge
      timeToFirstApproval
      firstReviewAt
      firstApprovalAt
    }
    author {
      id
      avatar
      handle
      name
    }
    repository {
      id
      name
      fullName
    }
  }
`);
