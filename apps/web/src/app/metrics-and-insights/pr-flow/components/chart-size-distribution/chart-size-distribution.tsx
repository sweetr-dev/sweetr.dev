import { useEffect, useRef } from "react";
import {
  ECOption,
  echarts,
  formatAxisDate,
  formatTooltipDate,
} from "../../../../../providers/echarts.provider";
import {
  PullRequestSizeDistributionChartData,
  Period,
} from "@sweetr/graphql-types/frontend/graphql";
import { CallbackDataParams } from "echarts/types/dist/shared";
import { UTCDate } from "@date-fns/utc";

const PR_FLOW_GROUP = "prFlow";

type Arrayable<T> = T | T[];

interface ChartSizeDistributionProps {
  chartId: string;
  chartData?: PullRequestSizeDistributionChartData | null;
  period: Period;
}

export const ChartSizeDistribution = ({
  chartId,
  chartData,
  period,
}: ChartSizeDistributionProps) => {
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
        padding: [10, 0],
        textStyle: {
          color: "#fff",
          fontSize: 14,
        },
        formatter: function (params: Arrayable<CallbackDataParams>) {
          let total = 0;
          let avgLine = "";
          let tooltipContent = `<div style="padding: 0 15px;">${(params as any)[0].axisValueLabel}</div>`;

          (params as Array<CallbackDataParams>).forEach(function (item) {
            if (item.seriesName === "Avg. Lines Changed") {
              avgLine = `<div style="padding: 0 15px;">${item.marker} ${item.seriesName}: ${item.value}</div>`;
              return;
            }
            total += item.value as number;
            tooltipContent += `<div style="padding: 0 15px;">${item.marker} ${item.seriesName}: ${item.value}</div>`;
          });

          tooltipContent += `<div style="padding: 5px 15px 0 15px; margin-top: 5px; border-top: 1px solid #373A40;"><div style="height: 10px; width: 10px; border-radius: 50%; background-color: #373A40; display: inline-block; margin-right: 10px;"></div>Total: ${total}</div>`;
          tooltipContent += avgLine;

          return tooltipContent;
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
        left: "0",
        right: "0",
        bottom: "3%",
        top: "50px",
      },
      xAxis: {
        data: chartData.columns,
        axisLabel: {
          formatter(value: string) {
            return formatAxisDate(new UTCDate(value), period);
          },
        },
      },
      legend: {
        data: [
          "Tiny",
          "Small",
          "Medium",
          "Large",
          "Huge",
          "Avg. Lines Changed",
        ],
        formatter(name) {
          return (
            {
              Tiny: "T",
              Small: "S",
              Medium: "M",
              Large: "X",
              Huge: "XL",
              "Avg. Lines Changed": "Avg. Lines Changed",
            }[name] || name
          );
        },
        top: 0,
      },
      yAxis: [
        {
          min: 0,
          minInterval: 1,
        },
        {
          min: 0,
          splitLine: { show: false },
          axisLabel: {
            formatter: (value: number) =>
              value >= 1000 ? `${value / 1000}K` : `${value}`,
          },
        },
      ],
      series: [
        ...chartData.series.map((chartSeries) => ({
          barCategoryGap: "50%",
          barGap: "50%",
          name: chartSeries.name,
          data: chartSeries.data,
          color: chartSeries.color || undefined,
          smooth: true,
          symbolSize: 7,
          type: "bar" as const,
          stack: "Total",
          yAxisIndex: 0,
        })),
        {
          name: "Avg. Lines Changed",
          data: chartData.averageLinesChanged,
          type: "line" as const,
          smooth: true,
          symbol: "circle",
          symbolSize: 5,
          yAxisIndex: 1,
          lineStyle: { width: 2, color: "#ADB5BD" },
          itemStyle: { color: "#ADB5BD" },
          z: 10,
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
