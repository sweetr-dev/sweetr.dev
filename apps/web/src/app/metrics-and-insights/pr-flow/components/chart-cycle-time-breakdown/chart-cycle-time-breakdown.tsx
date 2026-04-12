import { useEffect, useRef } from "react";
import {
  ECOption,
  echarts,
  formatAxisDate,
  formatTooltipDate,
} from "../../../../../providers/echarts.provider";
import {
  NumericChartData,
  Period,
} from "@sweetr/graphql-types/frontend/graphql";
import { formatMsDuration } from "../../../../../providers/date.provider";
import { UTCDate } from "@date-fns/utc";

const PR_FLOW_GROUP = "prFlow";

interface CycleTimeBreakdownData {
  cycleTime?: NumericChartData | null;
  timeToCode?: NumericChartData | null;
  timeToFirstReview?: NumericChartData | null;
  timeToApproval?: NumericChartData | null;
  timeToMerge?: NumericChartData | null;
}

interface ChartCycleTimeBreakdownProps {
  chartId: string;
  chartData: CycleTimeBreakdownData;
  period: Period;
}

const STACKED_SERIES = [
  { key: "timeToCode" as const, name: "Time to Code", color: "#ffd43b" },
  { key: "timeToFirstReview" as const, name: "Time to First Review", color: "#74c0fc" },
  { key: "timeToApproval" as const, name: "Time to Approve", color: "#b197fc" },
  { key: "timeToMerge" as const, name: "Time to Merge", color: "#8ce99a" },
];

const formatDurationValue = (value: unknown): string => {
  if (!value) return "0s";
  const ms = parseInt(value as string);
  return (
    formatMsDuration(ms, [
      "years",
      "months",
      "weeks",
      "days",
      "hours",
      "minutes",
      "seconds",
    ]) || `${Math.round(ms / 1000)} seconds`
  );
};

const computePercentages = (chartData: CycleTimeBreakdownData, columns: string[]) => {
  const raw = STACKED_SERIES.map(({ key }) =>
    chartData[key]?.data ?? columns.map(() => 0)
  );

  const totals = columns.map((_, i) =>
    raw.reduce((sum, series) => sum + (Number(series[i]) || 0), 0)
  );

  return raw.map((series) =>
    series.map((val, i) => (totals[i] > 0 ? (Number(val) / totals[i]) * 100 : 0))
  );
};

export const ChartCycleTimeBreakdown = ({
  chartId,
  chartData,
  period,
}: ChartCycleTimeBreakdownProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const columns = chartData.cycleTime?.columns;
    if (!columns) return;

    const chart = echarts.init(containerRef.current, "dark");
    chart.group = PR_FLOW_GROUP;
    echarts.connect(PR_FLOW_GROUP);

    const percentages = computePercentages(chartData, columns);

    const rawValues = STACKED_SERIES.map(({ key }) =>
      chartData[key]?.data ?? columns.map(() => 0)
    );

    const stackedSeries = STACKED_SERIES.map(({ name, color }, i) => ({
      type: "line" as const,
      name,
      stack: "cycle-time",
      data: percentages[i],
      smooth: true,
      color,
      symbol: "none" as const,
      lineStyle: { width: 1 },
      emphasis: { focus: "series" as const },
      areaStyle: { opacity: 0.75, color },
    }));

    const cycleTimeRaw = chartData.cycleTime?.data ?? [];

    const options: ECOption = {
      backgroundColor: "transparent",
      legend: {
        show: true,
        bottom: 0,
        textStyle: { color: "#C1C2C5", fontSize: 12 },
        itemGap: 16,
        icon: "roundRect",
        itemWidth: 12,
        itemHeight: 8,
      },
      tooltip: {
        trigger: "axis",
        backgroundColor: "#25262B",
        borderColor: "#303030",
        padding: [10, 15],
        textStyle: { color: "#fff", fontSize: 14 },
        formatter(params) {
          if (!Array.isArray(params) || params.length === 0) return "";
          const idx = params[0].dataIndex!;
          const dateLabel = formatTooltipDate(new UTCDate(columns[idx]), period);

          let html = `<div style="margin-bottom:8px;font-weight:600">${dateLabel}</div>`;
          html += `<div style="margin-bottom:6px;color:#ff6b6b">Cycle Time: ${formatDurationValue(cycleTimeRaw[idx])}</div>`;

          for (let i = 0; i < STACKED_SERIES.length; i++) {
            const { name: sName, color: sColor } = STACKED_SERIES[i];
            const absVal = rawValues[i][idx];
            const pct = percentages[i][idx];
            html += `<div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">`;
            html += `<span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${sColor}"></span>`;
            html += `<span>${sName}</span>`;
            html += `<span style="margin-left:auto;font-weight:500">${formatDurationValue(absVal)} (${Math.round(pct)}%)</span>`;
            html += `</div>`;
          }

          return html;
        },
        axisPointer: {
          type: "line",
          snap: true,
          lineStyle: { color: "#555", type: "dashed" },
        },
      },
      grid: {
        left: "1%",
        right: "1%",
        bottom: "12%",
        top: "4%",
        containLabel: true,
      },
      xAxis: {
        boundaryGap: false,
        data: columns,
        axisLabel: {
          formatter(value) {
            return formatAxisDate(new UTCDate(value), period);
          },
        },
      },
      yAxis: {
        min: 0,
        max: 100,
        axisLabel: {
          formatter: (value: number) => `${value}%`,
        },
      },
      series: stackedSeries,
    };

    chart.setOption(options);

    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.dispose();
    };
  }, [chartData, period, chartId]);

  return (
    <div
      ref={containerRef}
      id={chartId}
      style={{ width: "100%", flex: 1, minHeight: 0 }}
    />
  );
};
