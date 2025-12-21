export default /* GraphQL */ `
  enum Period {
    DAILY
    WEEKLY
    MONTHLY
    QUARTERLY
    YEARLY
  }

  input DateTimeRange {
    "The start of the date range"
    from: DateTime

    "The end of the date range"
    to: DateTime
  }
`;
