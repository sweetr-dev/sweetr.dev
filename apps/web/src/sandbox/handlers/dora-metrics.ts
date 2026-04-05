import { graphql, HttpResponse } from "msw";
import { Period } from "@sweetr/graphql-types/frontend/graphql";
import { generateChartData } from "../generators/chart-data";
import {
  INCREASING_TREND,
  IMPROVING_TREND,
  LOW_FAILURE_RATE,
} from "../generators/patterns";
import { subMonths } from "date-fns";

function getInputDefaults(input: Record<string, unknown>) {
  const dateRange = (input.dateRange ?? {}) as {
    from?: string;
    to?: string;
  };
  const from = dateRange.from ?? subMonths(new Date(), 6).toISOString();
  const to = dateRange.to ?? new Date().toISOString();
  const period = (input.period as Period) ?? Period.WEEKLY;
  return { from, to, period };
}

const breakdownStage = (current: number, previous: number) => ({
  __typename: "BreakdownStage" as const,
  currentAmount: current,
  previousAmount: previous,
  change: previous === 0 ? 0 : Math.round(((current - previous) / previous) * 100),
});

export const doraMetricsHandlers = [
  graphql.query("DoraMetrics", ({ variables }) => {
    const input = variables.input as Record<string, unknown>;
    const { from, to, period } = getInputDefaults(input);

    const depFreq = generateChartData(from, to, period, INCREASING_TREND, 2);
    const leadTime = generateChartData(from, to, period, IMPROVING_TREND, 3600000);
    const cfr = generateChartData(from, to, period, LOW_FAILURE_RATE, 1);
    const mttr = generateChartData(from, to, period, IMPROVING_TREND, 1800000);

    const periodRange = {
      currentPeriod: {
        __typename: "DateTimeRangeValue" as const,
        from,
        to,
      },
      previousPeriod: {
        __typename: "DateTimeRangeValue" as const,
        from: subMonths(new Date(from), 3).toISOString(),
        to: from,
      },
    };

    return HttpResponse.json({
      data: {
        workspace: {
          __typename: "Workspace",
          metrics: {
            __typename: "Metrics",
            dora: {
              __typename: "DoraMetrics",
              deploymentFrequency: {
                __typename: "DeploymentFrequencyMetric",
                currentAmount: 62,
                previousAmount: 38,
                change: 63,
                avg: 4.2,
                columns: depFreq.columns,
                data: depFreq.data,
                ...periodRange,
              },
              leadTime: {
                __typename: "LeadTimeMetric",
                currentAmount: 86400000,
                previousAmount: 172800000,
                change: -50,
                columns: leadTime.columns,
                data: leadTime.data,
                ...periodRange,
                breakdown: {
                  __typename: "LeadTimeBreakdown",
                  codingTime: breakdownStage(14400000, 21600000),
                  timeToFirstReview: breakdownStage(3600000, 7200000),
                  timeToApprove: breakdownStage(7200000, 14400000),
                  timeToMerge: breakdownStage(1800000, 3600000),
                  timeToDeploy: breakdownStage(900000, 1800000),
                },
              },
              changeFailureRate: {
                __typename: "ChangeFailureRateMetric",
                currentAmount: 6,
                previousAmount: 12,
                change: -50,
                columns: cfr.columns,
                data: cfr.data,
                ...periodRange,
              },
              meanTimeToRecover: {
                __typename: "MeanTimeToRecoverMetric",
                currentAmount: 5400000,
                previousAmount: 10800000,
                change: -50,
                columns: mttr.columns,
                data: mttr.data,
                ...periodRange,
              },
            },
          },
        },
      },
    });
  }),
];
