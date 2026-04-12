import { useEffect, useRef } from "react";
import {
  ECOption,
  echarts,
  formatAxisDate,
  formatTooltipDate,
} from "../../../../../providers/echarts.provider";
import {
  NumericSeriesChartData,
  Period,
} from "@sweetr/graphql-types/frontend/graphql";
import { UTCDate } from "@date-fns/utc";

const PR_FLOW_GROUP = "prFlow";

interface ChartThroughputProps {
  chartId: string;
  chartData?: NumericSeriesChartData | null;
  period: Period;
}

export const ChartThroughput = ({
  chartId,
  chartData,
  period,
}: ChartThroughputProps) => {
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
      legend: {
        data: chartData.series.map((s) => s.name),
        top: 0,
      },
      grid: {
        left: "1%",
        right: "4%",
        bottom: "3%",
        top: "30px",
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
        min: 0,
        minInterval: 1,
      },
      series: chartData.series.map((chartSeries) => ({
        name: chartSeries.name,
        type: "line" as const,
        data: chartSeries.data,
        smooth: true,
        connectNulls: true,
        color: chartSeries.color || undefined,
        symbolSize: 7,
        lineStyle: { width: 2 },
        areaStyle: {
          opacity: 0.2,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: chartSeries.color || "#8ce99a" },
            { offset: 1, color: "rgba(1, 191, 236, 0)" },
          ]),
        },
      })),
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
