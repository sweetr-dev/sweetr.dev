import { graphql, HttpResponse } from "msw";
import { Period } from "@sweetr/graphql-types/frontend/graphql";
import { subMonths } from "date-fns";
import { generateChartData } from "../generators/chart-data";
import {
  IMPROVING_TREND,
  REVIEW_SPEED_IMPROVING,
} from "../generators/patterns";
import { codeReviewDistributionFixture } from "../fixtures/code-reviews";

const MS_HOUR = 3_600_000;
const MS_DAY = 86_400_000;
const PR = "https://github.com/sweetr-dev/sweetr.dev/pull";

function getFlowInput(variables: Record<string, unknown>) {
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

function previousPeriodForRange(from: string, to: string) {
  const start = new Date(from).getTime();
  const end = new Date(to).getTime();
  const len = Math.max(end - start, MS_DAY);
  return {
    __typename: "DateTimeRangeValue" as const,
    from: new Date(start - len).toISOString(),
    to: new Date(start).toISOString(),
  };
}

function currentPeriod(from: string, to: string) {
  return {
    __typename: "DateTimeRangeValue" as const,
    from,
    to,
  };
}

/** x = lines changed, y = comment count — matches code-review-efficiency service. */
const sizeCommentCorrelation = {
  __typename: "ScatterChartData" as const,
  series: [
    {
      __typename: "ScatterChartSeries" as const,
      name: "Tiny",
      color: "#8ce9e3",
      data: [
        {
          __typename: "ScatterPoint" as const,
          x: 22,
          y: 1,
          title: "chore: bump eslint",
          url: `${PR}/88`,
        },
      ],
    },
    {
      __typename: "ScatterChartSeries" as const,
      name: "Small",
      color: "#8ce99a",
      data: [
        {
          __typename: "ScatterPoint" as const,
          x: 118,
          y: 4,
          title: "refactor: extract date helpers",
          url: `${PR}/94`,
        },
      ],
    },
    {
      __typename: "ScatterChartSeries" as const,
      name: "Medium",
      color: "#FFEC99",
      data: [
        {
          __typename: "ScatterPoint" as const,
          x: 127,
          y: 3,
          title: "fix: docs links",
          url: `${PR}/97`,
        },
        {
          __typename: "ScatterPoint" as const,
          x: 380,
          y: 11,
          title: "feat: metrics date range presets",
          url: `${PR}/98`,
        },
      ],
    },
    {
      __typename: "ScatterChartSeries" as const,
      name: "Large",
      color: "#ffb76b",
      data: [
        {
          __typename: "ScatterPoint" as const,
          x: 980,
          y: 22,
          title: "feat: team workload charts",
          url: `${PR}/99`,
        },
      ],
    },
    {
      __typename: "ScatterChartSeries" as const,
      name: "Huge",
      color: "#FF6B6B",
      data: [
        {
          __typename: "ScatterPoint" as const,
          x: 2249,
          y: 50,
          title: "feat: sandbox demo mode",
          url: `${PR}/100`,
        },
        {
          __typename: "ScatterPoint" as const,
          x: 708,
          y: 28,
          title: "feat: improve onboarding",
          url: `${PR}/103`,
        },
      ],
    },
  ],
};

export const codeReviewEfficiencyMetricsHandlers = [
  graphql.query("CodeReviewEfficiencyMetrics", ({ variables }) => {
    const { from, to, period } = getFlowInput(variables);
    const reviewTurnaround = generateChartData(
      from,
      to,
      period,
      REVIEW_SPEED_IMPROVING,
      MS_HOUR * 1.8,
    );
    const timeToApprovalChart = generateChartData(
      from,
      to,
      period,
      IMPROVING_TREND,
      MS_HOUR * 2.2,
    );

    const prev = previousPeriodForRange(from, to);
    const curr = currentPeriod(from, to);

    const distribution =
      codeReviewDistributionFixture.workspace.metrics.codeReviewDistribution;

    return HttpResponse.json({
      data: {
        workspace: {
          __typename: "Workspace",
          metrics: {
            __typename: "Metrics",
            codeReviewEfficiency: {
              __typename: "CodeReviewEfficiencyMetrics",
              prsWithoutApproval: 1,
              reviewTurnaroundTime: {
                __typename: "NumericChartData",
                columns: reviewTurnaround.columns,
                data: reviewTurnaround.data,
              },
              timeToApproval: {
                __typename: "NumericChartData",
                columns: timeToApprovalChart.columns,
                data: timeToApprovalChart.data,
              },
              kpiTimeToFirstReview: {
                __typename: "CodeReviewDurationKpi",
                currentAmount: 6.7 * MS_HOUR,
                previousAmount: 11.5 * MS_HOUR,
                change: -42,
                currentPeriod: curr,
                previousPeriod: prev,
              },
              kpiTimeToApproval: {
                __typename: "CodeReviewDurationKpi",
                currentAmount: 2.1 * MS_HOUR,
                previousAmount: 9.5 * MS_HOUR,
                change: -78,
                currentPeriod: curr,
                previousPeriod: prev,
              },
              kpiAvgCommentsPerPr: {
                __typename: "CodeReviewFloatKpi",
                currentAmount: 6.8,
                previousAmount: 5.2,
                change: 31,
                currentPeriod: curr,
                previousPeriod: prev,
              },
              kpiPrsWithoutApproval: {
                __typename: "CodeReviewCountKpi",
                currentAmount: 1,
                previousAmount: 4,
                change: -75,
                currentPeriod: curr,
                previousPeriod: prev,
              },
              sizeCommentCorrelation,
              codeReviewDistribution: {
                __typename: "CodeReviewDistributionChartData",
                totalReviews: distribution.totalReviews,
                entities: distribution.entities.map((e) => ({ ...e })),
                links: distribution.links.map((l) => ({ ...l })),
              },
              teamOverview: [
                {
                  __typename: "CodeReviewTeamOverviewRow",
                  teamId: null,
                  teamName: "All teams",
                  teamIcon: "",
                  avgTimeToFirstReview: Math.round(6.7 * MS_HOUR),
                  avgTimeToApproval: Math.round(2.1 * MS_HOUR),
                  prsWithoutApproval: 1,
                },
                {
                  __typename: "CodeReviewTeamOverviewRow",
                  teamId: "1",
                  teamName: "Platform",
                  teamIcon: "🛠️",
                  avgTimeToFirstReview: Math.round(6.2 * MS_HOUR),
                  avgTimeToApproval: Math.round(1.9 * MS_HOUR),
                  prsWithoutApproval: 0,
                },
                {
                  __typename: "CodeReviewTeamOverviewRow",
                  teamId: "2",
                  teamName: "Frontend",
                  teamIcon: "🎨",
                  avgTimeToFirstReview: Math.round(7.4 * MS_HOUR),
                  avgTimeToApproval: Math.round(2.4 * MS_HOUR),
                  prsWithoutApproval: 1,
                },
              ],
            },
          },
        },
      },
    });
  }),
];
