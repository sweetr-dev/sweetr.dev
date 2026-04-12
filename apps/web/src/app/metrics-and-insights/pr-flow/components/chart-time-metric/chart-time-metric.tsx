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
import {
  formatMsDuration,
  getAbbreviatedDuration,
} from "../../../../../providers/date.provider";
import { UTCDate } from "@date-fns/utc";

const PR_FLOW_GROUP = "prFlow";

interface ChartTimeMetricProps {
  chartId: string;
  chartData?: NumericChartData | null;
  period: Period;
}

export const ChartTimeMetric = ({
  chartId,
  chartData,
  period,
}: ChartTimeMetricProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartData || !containerRef.current) return;

    const chart = echarts.init(containerRef.current, "dark");
    chart.group = PR_FLOW_GROUP;
    echarts.connect(PR_FLOW_GROUP);

    const options: ECOption = {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        backgroundColor: "#25262B",
        borderColor: "#303030",
        padding: [10, 15],
        textStyle: {
          color: "#fff",
          fontSize: 14,
        },
        valueFormatter(value) {
          if (!value) return "0 hours";

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
        },
        axisPointer: {
          type: "line",
          snap: true,
          lineStyle: {
            color: "#555",
            type: "dashed",
          },
          label: {
            formatter({ value }) {
              return formatTooltipDate(new UTCDate(value), period);
            },
          },
        },
      },
      grid: {
        left: "1%",
        right: "1%",
        bottom: "3%",
        top: "4%",
        containLabel: true,
      },
      xAxis: {
        boundaryGap: false,
        data: chartData.columns,
        axisLabel: {
          formatter(value) {
            return formatAxisDate(new UTCDate(value), period);
          },
        },
      },
      yAxis: {
        boundaryGap: true,
        min: 0,
        axisLabel: {
          formatter(value) {
            return getAbbreviatedDuration(parseInt(value));
          },
        },
      },
      series: [
        {
          type: "line",
          data: chartData.data,
          smooth: true,
          connectNulls: true,
          color: "#8ce99a",
          symbolSize: 7,
          lineStyle: { width: 2 },
          areaStyle: {
            opacity: 0.2,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "#8ce99a" },
              { offset: 1, color: "rgba(1, 191, 236, 0)" },
            ]),
          },
        },
      ],
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
