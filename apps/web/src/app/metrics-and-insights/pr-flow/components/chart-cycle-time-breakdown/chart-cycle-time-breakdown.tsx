import { useEffect, useRef } from "react";
import {
  ECOption,
  echarts,
  formatAxisDate,
  formatTooltipDate,
} from "../../../../../providers/echarts.provider";
import {
  CycleTimeBreakdownChartData,
  Period,
} from "@sweetr/graphql-types/frontend/graphql";
import { getAbbreviatedDuration } from "../../../../../providers/date.provider";
import { UTCDate } from "@date-fns/utc";

const PR_FLOW_GROUP = "prFlow";

interface ChartCycleTimeBreakdownProps {
  chartId: string;
  chartData?: CycleTimeBreakdownChartData | null;
  period: Period;
}

const STACKED_SERIES: {
  key: keyof Pick<
    CycleTimeBreakdownChartData,
    "timeToCode" | "timeToFirstReview" | "timeToApproval" | "timeToMerge"
  >;
  name: string;
  color: string;
}[] = [
  { key: "timeToCode", name: "Coding", color: "#FFF " },
  { key: "timeToFirstReview", name: "First Review", color: "#38d9a9" },
  { key: "timeToApproval", name: "Approval", color: "#8ce99a" },
  { key: "timeToMerge", name: "Merge", color: "#b197fc" },
];

const formatDurationValue = (value: unknown): string => {
  if (!value) return "0s";
  return getAbbreviatedDuration(parseInt(value as string)) || "0s";
};

export const ChartCycleTimeBreakdown = ({
  chartId,
  chartData,
  period,
}: ChartCycleTimeBreakdownProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !chartData) return;

    const { columns, cycleTime } = chartData;
    if (!columns.length) return;

    const chart = echarts.init(containerRef.current, "dark");
    chart.group = PR_FLOW_GROUP;
    echarts.connect(PR_FLOW_GROUP);

    const stackedSeries = STACKED_SERIES.map(({ key, name, color }, i) => ({
      type: "bar" as const,
      name,
      stack: "cycle-time",
      data: chartData[key],
      color,
      barMaxWidth: 24,
      itemStyle: {
        borderColor: "#1A1B1E",
        borderWidth: 1,
      },
      emphasis: { focus: "series" as const },
    }));

    const cycleTimeSeries = {
      type: "line" as const,
      name: "Cycle Time",
      data: cycleTime,
      smooth: true,
      connectNulls: true,
      color: "#8ce99a",
      symbolSize: 0,
      lineStyle: { width: 2 },
      label: {
        show: true,
        position: "top" as const,
        formatter: ({ value }: { value?: unknown }) => {
          const val = Number(value) || 0;
          if (!val) return "0s";
          return getAbbreviatedDuration(val);
        },
        fontSize: 10,
        color: "#fff",
      },
    };

    const options: ECOption = {
      backgroundColor: "transparent",
      legend: {
        show: true,
        bottom: 0,
        textStyle: { color: "#C1C2C5", fontSize: 12 },
        itemGap: 16,
        icon: "roundRect",
        itemWidth: 16,
        itemHeight: 12,
      },
      tooltip: {
        trigger: "axis",
        backgroundColor: "#25262B",
        borderColor: "#303030",
        padding: [0, 15],
        textStyle: { color: "#fff", fontSize: 14 },
        formatter(params) {
          if (!Array.isArray(params) || params.length === 0) return "";
          const idx = params[0].dataIndex!;
          const dateLabel = formatTooltipDate(
            new UTCDate(columns[idx]),
            period,
          );

          const total = STACKED_SERIES.reduce(
            (sum, { key }) => sum + (Number(chartData[key][idx]) || 0),
            0,
          );

          let html = `<div style="padding: 5px 0; font-weight:600">${dateLabel}</div>`;

          html += `<div style="margin: 0 -15px; padding: 5px 15px; border-top:1px solid #404040;">`;
          for (const { key, name: sName, color: sColor } of STACKED_SERIES) {
            const absVal = Number(chartData[key][idx]) || 0;
            const pct = total > 0 ? Math.round((absVal / total) * 100) : 0;
            html += `<div style="display:flex;align-items:center;gap:5px;margin-bottom:2px">`;
            html += `<span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${sColor}"></span>`;
            html += `<span style="padding-right: 40px;">${sName}</span>`;
            html += `<span style="margin-left:auto;font-weight:500">${formatDurationValue(absVal)} </span>`;
            html += `</div>`;
          }
          html += `</div>`;

          html += `
            <div style="margin: 0 -15px; padding: 5px 15px; border-top:1px solid #404040; display:flex; align-items:center; gap:5px;">
              <span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:#8ce99a"></span>
              <span>Cycle Time</span>
              <span style="margin-left:auto;font-weight:600">${formatDurationValue(cycleTime[idx])}</span>
            </div>`;

          return html;
        },
        axisPointer: {
          type: "shadow",
        },
      },
      grid: {
        left: "0",
        right: "0",
        bottom: "40px",
        top: "15px",
        containLabel: true,
      },
      xAxis: {
        data: columns,
        axisLabel: {
          formatter(value: string) {
            return formatAxisDate(new UTCDate(value), period);
          },
        },
      },
      yAxis: {
        min: 0,
        axisLabel: {
          formatter(value: string) {
            return getAbbreviatedDuration(parseInt(value));
          },
        },
      },
      series: [...stackedSeries, cycleTimeSeries],
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
