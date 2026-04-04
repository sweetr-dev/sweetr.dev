import { graphql, HttpResponse } from "msw";
import { personalMetricsFixture } from "../fixtures/personal-metrics";
import { teammatesFixture } from "../fixtures/people";

export const homeHandlers = [
  graphql.query("PersonalMetrics", () => {
    return HttpResponse.json({ data: personalMetricsFixture });
  }),

  graphql.query("Teammates", ({ variables }) => {
    return HttpResponse.json({
      data: teammatesFixture(variables.handle as string),
    });
  }),
];
