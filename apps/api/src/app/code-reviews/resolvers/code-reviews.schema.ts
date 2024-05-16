export default /* GraphQL */ `
  enum CodeReviewState {
    COMMENTED
    APPROVED
    CHANGES_REQUESTED
  }

  type CodeReview {
    id: SweetID!

    "The amount of comments"
    commentCount: Int!

    "The state of the code review"
    state: CodeReviewState!

    "The time when the code review was created"
    createdAt: DateTime!

    "The author"
    author: Person!
  }

  input CodeReviewsInput {
    "The pagination cursor"
    cursor: SweetID

    "The date to filter from"
    from: DateTime

    "The date to filter to"
    to: DateTime

    "The state to filter by"
    state: CodeReviewState
  }

  extend type Person {
    codeReviews(input: CodeReviewsInput): [CodeReview!]!
  }
`;
