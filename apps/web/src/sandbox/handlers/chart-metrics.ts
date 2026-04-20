import { graphql, HttpResponse } from "msw";
import { Period } from "@sweetr/graphql-types/frontend/graphql";
import { generateChartData, generateBuckets, mapPattern } from "../generators/chart-data";
import {
  IMPROVING_TREND,
  REVIEW_SPEED_IMPROVING,
} from "../generators/patterns";
import { codeReviewDistributionFixture } from "../fixtures/code-reviews";
import { subMonths } from "date-fns";

function getTeamInput(variables: Record<string, unknown>) {
  const input = variables.input as Record<string, unknown>;
  const dateRange = (input.dateRange ?? {}) as {
    from?: string;
    to?: string;
  };
  const from = dateRange.from ?? subMonths(new Date(), 3).toISOString();
  const to = dateRange.to ?? new Date().toISOString();
  const period = (input.period as Period) ?? Period.WEEKLY;
  return { from, to, period };
}

const MS_HOUR = 3_600_000;

export const chartMetricsHandlers = [
  graphql.query("ChartCycleTime", ({ variables }) => {
    const { from, to, period } = getTeamInput(variables);
    const chart = generateChartData(from, to, period, IMPROVING_TREND, 48 * MS_HOUR);
    return HttpResponse.json({
      data: {
        workspace: {
          __typename: "Workspace",
          metrics: {
            __typename: "Metrics",
            cycleTime: {
              __typename: "NumericChartData",
              ...chart,
            },
          },
        },
      },
    });
  }),

  graphql.query("ChartTimeToMerge", ({ variables }) => {
    const { from, to, period } = getTeamInput(variables);
    const chart = generateChartData(from, to, period, IMPROVING_TREND, 4 * MS_HOUR);
    return HttpResponse.json({
      data: {
        workspace: {
          __typename: "Workspace",
          metrics: {
            __typename: "Metrics",
            timeToMerge: {
              __typename: "NumericChartData",
              ...chart,
            },
          },
        },
      },
    });
  }),

  graphql.query("ChartTimeToFirstReview", ({ variables }) => {
    const { from, to, period } = getTeamInput(variables);
    const chart = generateChartData(from, to, period, REVIEW_SPEED_IMPROVING, MS_HOUR);
    return HttpResponse.json({
      data: {
        workspace: {
          __typename: "Workspace",
          metrics: {
            __typename: "Metrics",
            timeForFirstReview: {
              __typename: "NumericChartData",
              ...chart,
            },
          },
        },
      },
    });
  }),

  graphql.query("ChartTimeToApproval", ({ variables }) => {
    const { from, to, period } = getTeamInput(variables);
    const chart = generateChartData(from, to, period, REVIEW_SPEED_IMPROVING, 2 * MS_HOUR);
    return HttpResponse.json({
      data: {
        workspace: {
          __typename: "Workspace",
          metrics: {
            __typename: "Metrics",
            timeForApproval: {
              __typename: "NumericChartData",
              ...chart,
            },
          },
        },
      },
    });
  }),

  graphql.query("PullRequestSizeDistribution", ({ variables }) => {
    const { from, to, period } = getTeamInput(variables);
    const columns = generateBuckets(from, to, period);
    const len = columns.length;

    return HttpResponse.json({
      data: {
        workspace: {
          __typename: "Workspace",
          metrics: {
            __typename: "Metrics",
            pullRequestSizeDistribution: {
              __typename: "NumericSeriesChartData",
              columns,
              series: [
                {
                  __typename: "ChartNumericSeries",
                  name: "Tiny",
                  color: "#51cf66",
                  data: mapPattern(
                    [15, 18, 20, 22, 25, 28, 30, 32, 35, 38, 40, 42],
                    len,
                  ),
                },
                {
                  __typename: "ChartNumericSeries",
                  name: "Small",
                  color: "#69db7c",
                  data: mapPattern(
                    [25, 26, 28, 30, 30, 32, 32, 33, 34, 35, 35, 36],
                    len,
                  ),
                },
                {
                  __typename: "ChartNumericSeries",
                  name: "Medium",
                  color: "#ffd43b",
                  data: mapPattern(
                    [30, 28, 26, 24, 22, 20, 20, 18, 16, 14, 14, 12],
                    len,
                  ),
                },
                {
                  __typename: "ChartNumericSeries",
                  name: "Large",
                  color: "#ff922b",
                  data: mapPattern(
                    [20, 18, 16, 15, 14, 12, 11, 10, 9, 8, 7, 6],
                    len,
                  ),
                },
                {
                  __typename: "ChartNumericSeries",
                  name: "Huge",
                  color: "#ff6b6b",
                  data: mapPattern(
                    [10, 10, 10, 9, 9, 8, 7, 7, 6, 5, 4, 4],
                    len,
                  ),
                },
              ],
            },
          },
        },
      },
    });
  }),

  graphql.query("ChartCodeReviewDistribution", () => {
    return HttpResponse.json({ data: codeReviewDistributionFixture });
  }),

  graphql.query("CodeReviewDistributionWorkspace", () => {
    const distributionData =
      codeReviewDistributionFixture.workspace.metrics.codeReviewDistribution;
    return HttpResponse.json({
      data: {
        workspace: {
          __typename: "Workspace",
          metrics: {
            __typename: "Metrics",
            codeReviewEfficiency: {
              __typename: "CodeReviewEfficiencyMetrics",
              codeReviewDistribution: distributionData,
            },
          },
        },
      },
    });
  }),
];
