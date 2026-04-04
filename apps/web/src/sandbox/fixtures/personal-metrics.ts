import type { PersonalMetricsQuery } from "@sweetr/graphql-types/frontend/graphql";

export const personalMetricsFixture = {
  workspace: {
    __typename: "Workspace" as const,
    me: {
      __typename: "Person" as const,
      personalMetrics: {
        __typename: "PersonalMetrics" as const,
        pullRequestSize: {
          __typename: "NumericPersonalMetric" as const,
          current: 320,
          previous: 480,
          change: -33,
        },
        codeReviewAmount: {
          __typename: "NumericPersonalMetric" as const,
          current: 12,
          previous: 8,
          change: 50,
        },
      },
    },
  },
} satisfies PersonalMetricsQuery;
