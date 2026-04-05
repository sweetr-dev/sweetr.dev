import { graphql, HttpResponse } from "msw";
import { personalMetricsFixture } from "../fixtures/personal-metrics";
import { teammatesFixture } from "../fixtures/people";

export const homeHandlers = [
  graphql.query("PersonalMetrics", () => {
    return HttpResponse.json({ data: personalMetricsFixture });
  }),

  graphql.query("Teammates", ({ variables }) => {
    const handle =
      variables && typeof variables.handle === "string"
        ? variables.handle
        : null;
    if (!handle) {
      return HttpResponse.json(
        { errors: [{ message: "Missing required variable: handle" }] },
        { status: 400 },
      );
    }
    return HttpResponse.json({
      data: teammatesFixture(handle),
    });
  }),
];
