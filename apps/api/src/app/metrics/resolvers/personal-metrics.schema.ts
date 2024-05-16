export default /* GraphQL */ `
  type NumericPersonalMetric {
    current: Int!
    previous: Int!

    "The difference percentage between current vs previous"
    change: Int!
  }

  "Personal improvement metrics over the last 30 days vs previous period"
  type PersonalMetrics {
    pullRequestSize: NumericPersonalMetric!
    codeReviewAmount: NumericPersonalMetric!
  }

  extend type Person {
    personalMetrics: PersonalMetrics!
  }
`;
