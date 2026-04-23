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
  onColumnClick?: (columnDate: string) => void;
}

const STACKED_SERIES: {
  key: keyof Pick<
    CycleTimeBreakdownChartData,
    "timeToCode" | "timeToFirstReview" | "timeToApproval" | "timeToMerge"
  >;
  name: string;
  color: string;
}[] = [
  { key: "timeToCode", name: "Coding", color: "#8ce0e9 " },
  { key: "timeToFirstReview", name: "First Review", color: "#8ce9c7" },
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
  onColumnClick,
}: ChartCycleTimeBreakdownProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !chartData) return;

    const { columns, cycleTime } = chartData;
    if (!columns.length) return;

    const chart = echarts.init(containerRef.current, "dark");
    chart.group = PR_FLOW_GROUP;
    echarts.connect(PR_FLOW_GROUP);

    // ECharts' barMinHeight breaks stacking (segments overlap instead of stack).
    // Instead, we clamp non-zero values to a % of the tallest column so every
    // phase stays visible regardless of how small it is relative to others.
    // Tooltips and labels read from the original chartData to show real values.
    const maxColumnTotal = Math.max(
      ...columns.map((_, idx) =>
        STACKED_SERIES.reduce(
          (sum, { key }) => sum + (Number(chartData[key][idx]) || 0),
          0,
        ),
      ),
    );
    const minVisibleValue = maxColumnTotal * 0.03;

    const clampedData: Record<string, number[]> = {};
    for (const { key } of STACKED_SERIES) {
      clampedData[key] = chartData[key].map((_, idx) => {
        const raw = Number(chartData[key][idx]) || 0;
        if (raw === 0) return 0;
        return Math.max(raw, minVisibleValue);
      });
    }

    const stackedSeries = STACKED_SERIES.map(({ key, name, color }) => ({
      type: "bar" as const,
      name,
      stack: "cycle-time",
      data: clampedData[key],
      color,
      barMaxWidth: 24,
      itemStyle: {
        borderColor: "#1A1B1E",
        borderWidth: 1,
      },
      emphasis: { focus: "series" as const },
    }));

    // Line must use clamped totals so it sits above the inflated bars.
    const clampedCycleTime = columns.map((_, idx) =>
      STACKED_SERIES.reduce(
        (sum, { key }) => sum + (clampedData[key][idx] || 0),
        0,
      ),
    );

    const cycleTimeSeries = {
      type: "line" as const,
      name: "Cycle Time",
      data: clampedCycleTime,
      smooth: true,
      connectNulls: true,
      color: "#FFFFFF",
      symbolSize: 0,
      lineStyle: { width: 2 },
      label: {
        show: cycleTime.length <= 15,
        position: "top" as const,
        // Use original cycleTime, not the clamped value ECharts passes.
        formatter: ({ dataIndex }: { dataIndex?: number }) => {
          const val = Number(cycleTime[dataIndex ?? 0]) || 0;
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

          let html = `<div style="padding: 5px 0; font-weight:600">${dateLabel}</div>`;

          html += `<div style="margin: 0 -15px; padding: 5px 15px; border-top:1px solid #404040;">`;
          for (const { key, name: sName, color: sColor } of STACKED_SERIES) {
            const absVal = Number(chartData[key][idx]) || 0;
            html += `<div style="display:flex;align-items:center;gap:5px;margin-bottom:2px">`;
            html += `<span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${sColor}"></span>`;
            html += `<span style="padding-right: 40px;">${sName}</span>`;
            html += `<span style="margin-left:auto;font-weight:500">${formatDurationValue(absVal)} </span>`;
            html += `</div>`;
          }
          html += `</div>`;

          html += `
            <div style="margin: 0 -15px; padding: 5px 15px; border-top:1px solid #404040; display:flex; align-items:center; gap:5px;">
              <span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:#FFFFFF"></span>
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

    if (onColumnClick) {
      chart.getZr().on("click", (e) => {
        if (!chart.containPixel("grid", [e.offsetX, e.offsetY])) return;
        const [dataIndex] = chart.convertFromPixel("grid", [
          e.offsetX,
          e.offsetY,
        ]);
        const col = columns[Math.round(dataIndex)];
        if (col) onColumnClick(col);
      });
      chart.getZr().on("mousemove", (e) => {
        if (chart.containPixel("grid", [e.offsetX, e.offsetY])) {
          chart.getZr().setCursorStyle("pointer");
        }
      });
    }

    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.dispose();
    };
  }, [chartData, period, chartId, onColumnClick]);

  return (
    <div
      ref={containerRef}
      id={chartId}
      style={{ width: "100%", flex: 1, minHeight: 0 }}
    />
  );
};
