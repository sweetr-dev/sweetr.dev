import { graphql, HttpResponse } from "msw";
import { Period } from "@sweetr/graphql-types/frontend/graphql";
import { subMonths } from "date-fns";
import { generateBuckets, mapPattern } from "../generators/chart-data";
import {
  IMPROVING_TREND,
  INCREASING_TREND,
  LOW_FAILURE_RATE,
  REVIEW_SPEED_IMPROVING,
} from "../generators/patterns";

const MS_HOUR = 3_600_000;
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

/** x = cycle time (hours), y = lines changed — matches API pr-flow service. */
const sizeCycleTimeCorrelation = {
  __typename: "ScatterChartData" as const,
  series: [
    {
      __typename: "ScatterChartSeries" as const,
      name: "Tiny",
      color: "#8ce9e3",
      data: [
        {
          __typename: "ScatterPoint" as const,
          x: 0.35,
          y: 18,
          title: "chore: bump eslint",
          url: `${PR}/88`,
        },
        {
          __typename: "ScatterPoint" as const,
          x: 0.62,
          y: 44,
          title: "fix: copy on login screen",
          url: `${PR}/92`,
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
          x: 1.1,
          y: 112,
          title: "refactor: extract date helpers",
          url: `${PR}/94`,
        },
        {
          __typename: "ScatterPoint" as const,
          x: 2.4,
          y: 156,
          title: "feat: workspace switcher",
          url: `${PR}/96`,
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
          x: 3.8,
          y: 412,
          title: "feat: metrics date range presets",
          url: `${PR}/98`,
        },
        {
          __typename: "ScatterPoint" as const,
          x: 5.2,
          y: 127,
          title: "fix: docs links",
          url: `${PR}/97`,
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
          x: 18,
          y: 892,
          title: "feat: team workload charts",
          url: `${PR}/99`,
        },
        {
          __typename: "ScatterPoint" as const,
          x: 28,
          y: 1240,
          title: "feat: DORA drill-down",
          url: `${PR}/101`,
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
          x: 42,
          y: 2249,
          title: "feat: sandbox demo mode",
          url: `${PR}/100`,
        },
        {
          __typename: "ScatterPoint" as const,
          x: 36,
          y: 708,
          title: "feat: improve onboarding",
          url: `${PR}/103`,
        },
        {
          __typename: "ScatterPoint" as const,
          x: 72,
          y: 3102,
          title: "feat: monorepo CI graph",
          url: `${PR}/104`,
        },
      ],
    },
  ],
};

export const prFlowMetricsHandlers = [
  graphql.query("PrFlowMetrics", ({ variables }) => {
    const { from, to, period } = getFlowInput(variables);
    const columns = generateBuckets(from, to, period);
    const len = columns.length;

    const opened = mapPattern(INCREASING_TREND, len, 0.45);
    const merged = mapPattern(IMPROVING_TREND, len, 0.42);
    const closed = mapPattern(LOW_FAILURE_RATE, len, 0.08);

    const cycleBase = mapPattern(IMPROVING_TREND, len, MS_HOUR * 14);
    const timeToCode = mapPattern(IMPROVING_TREND, len, MS_HOUR * 5);
    const timeToFirstReview = mapPattern(
      REVIEW_SPEED_IMPROVING,
      len,
      MS_HOUR * 2.5,
    );
    const timeToApproval = mapPattern(REVIEW_SPEED_IMPROVING, len, MS_HOUR * 4);
    const timeToMerge = mapPattern(IMPROVING_TREND, len, MS_HOUR * 1.2);

    const avgLines = mapPattern(
      [210, 205, 198, 220, 235, 228, 218, 240, 255, 248, 230, 225],
      len,
      1,
    );

    return HttpResponse.json({
      data: {
        workspace: {
          __typename: "Workspace",
          metrics: {
            __typename: "Metrics",
            prFlow: {
              __typename: "PullRequestFlowMetrics",
              throughput: {
                __typename: "NumericSeriesChartData",
                columns,
                series: [
                  {
                    __typename: "ChartNumericSeries",
                    name: "Opened",
                    color: "#8ce99a",
                    data: opened,
                  },
                  {
                    __typename: "ChartNumericSeries",
                    name: "Merged",
                    color: "#b197fc",
                    data: merged,
                  },
                  {
                    __typename: "ChartNumericSeries",
                    name: "Closed",
                    color: "#ff8787",
                    data: closed,
                  },
                ],
              },
              cycleTimeBreakdown: {
                __typename: "CycleTimeBreakdownChartData",
                columns,
                cycleTime: cycleBase,
                timeToCode,
                timeToFirstReview,
                timeToApproval,
                timeToMerge,
              },
              pullRequestSizeDistribution: {
                __typename: "PullRequestSizeDistributionChartData",
                columns,
                averageLinesChanged: avgLines,
                series: [
                  {
                    __typename: "ChartNumericSeries",
                    name: "Tiny",
                    color: "#8ce9e3",
                    data: mapPattern([4, 5, 4, 6, 5, 7, 6, 5, 8, 7, 6, 5], len),
                  },
                  {
                    __typename: "ChartNumericSeries",
                    name: "Small",
                    color: "#8ce99a",
                    data: mapPattern(
                      [12, 14, 13, 15, 16, 14, 18, 17, 15, 14, 13, 12],
                      len,
                    ),
                  },
                  {
                    __typename: "ChartNumericSeries",
                    name: "Medium",
                    color: "#FFEC99",
                    data: mapPattern(
                      [22, 24, 23, 26, 25, 28, 27, 26, 24, 23, 22, 21],
                      len,
                    ),
                  },
                  {
                    __typename: "ChartNumericSeries",
                    name: "Large",
                    color: "#ffb76b",
                    data: mapPattern(
                      [10, 11, 9, 12, 11, 10, 12, 11, 9, 8, 8, 7],
                      len,
                    ),
                  },
                  {
                    __typename: "ChartNumericSeries",
                    name: "Huge",
                    color: "#FF6B6B",
                    data: mapPattern([3, 2, 4, 3, 5, 4, 3, 4, 3, 2, 2, 3], len),
                  },
                ],
              },
              sizeCycleTimeCorrelation,
              teamOverview: [
                {
                  __typename: "TeamPrFlowOverviewRow",
                  teamId: null,
                  teamName: "All teams",
                  teamIcon: "",
                  medianCycleTime: Math.round(
                    cycleBase[len - 1] ?? 14 * MS_HOUR,
                  ),
                  mergedCount: merged.reduce((a, b) => a + b, 0),
                  avgLinesChanged: 228,
                  pctBigPrs: 18,
                },
                {
                  __typename: "TeamPrFlowOverviewRow",
                  teamId: "1",
                  teamName: "Platform",
                  teamIcon: "🛠️",
                  medianCycleTime: Math.round(
                    (cycleBase[len - 1] ?? 14 * MS_HOUR) * 0.92,
                  ),
                  mergedCount: Math.round(
                    merged.reduce((a, b) => a + b, 0) * 0.55,
                  ),
                  avgLinesChanged: 246,
                  pctBigPrs: 21,
                },
                {
                  __typename: "TeamPrFlowOverviewRow",
                  teamId: "2",
                  teamName: "Frontend",
                  teamIcon: "🎨",
                  medianCycleTime: Math.round(
                    (cycleBase[len - 1] ?? 14 * MS_HOUR) * 1.08,
                  ),
                  mergedCount: Math.round(
                    merged.reduce((a, b) => a + b, 0) * 0.45,
                  ),
                  avgLinesChanged: 198,
                  pctBigPrs: 14,
                },
              ],
            },
          },
        },
      },
    });
  }),
];
