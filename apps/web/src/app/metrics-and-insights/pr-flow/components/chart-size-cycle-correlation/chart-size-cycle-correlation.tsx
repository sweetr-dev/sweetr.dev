import { useEffect, useRef } from "react";
import { ECOption, echarts } from "../../../../../providers/echarts.provider";
import { ScatterChartData } from "@sweetr/graphql-types/frontend/graphql";
import {
  formatMsDuration,
  getAbbreviatedDuration,
} from "../../../../../providers/date.provider";
import { CallbackDataParams } from "echarts/types/dist/shared";

interface ChartSizeCycleCorrelationProps {
  chartId: string;
  chartData?: ScatterChartData | null;
}

export const ChartSizeCycleCorrelation = ({
  chartId,
  chartData,
}: ChartSizeCycleCorrelationProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartData || !containerRef.current) return;

    const chart = echarts.init(containerRef.current, "dark");

    const options: ECOption = {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        backgroundColor: "#25262B",
        borderColor: "#303030",
        padding: [10, 15],
        textStyle: {
          color: "#fff",
          fontSize: 13,
        },
        formatter(params: CallbackDataParams | CallbackDataParams[]) {
          const p = Array.isArray(params) ? params[0] : params;
          const data = p.data as { value: number[]; title?: string };
          const hours = data.value[0];
          const lines = data.value[1];

          const duration =
            formatMsDuration(hours * 3_600_000, [
              "years",
              "months",
              "weeks",
              "days",
              "hours",
              "minutes",
            ]) || `${Math.round(hours * 60)} minutes`;

          const title = data.title
            ? `<div style="max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-bottom: 6px; font-weight: 500;">${data.title}</div>`
            : "";

          return `${title}<div>${p.marker} ${p.seriesName}</div><div style="margin-top: 4px;">Cycle time: <b>${duration}</b></div><div>Lines changed: <b>${lines.toLocaleString()}</b></div>`;
        },
      },
      legend: {
        data: ["Tiny", "Small", "Medium", "Large", "Huge"],
        top: 0,
      },
      grid: {
        left: "20px",
        right: "0px",
        bottom: "20px",
        top: "40px",
        containLabel: true,
      },
      xAxis: {
        type: "log",
        name: "Cycle Time",
        nameLocation: "middle",
        nameGap: 30,
        min: 0.1,
        axisLabel: {
          formatter(value: number) {
            return getAbbreviatedDuration(value * 3_600_000);
          },
        },
      },
      yAxis: {
        type: "log",
        name: "Lines Changed",
        nameLocation: "middle",
        nameGap: 50,
        min: 1,
        axisLabel: {
          formatter(value: number) {
            if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
            return String(value);
          },
        },
      },
      series: chartData.series.map((s) => ({
        name: s.name,
        type: "scatter" as const,
        color: s.color || undefined,
        symbolSize: 8,
        itemStyle: { opacity: 0.75 },
        data: s.data
          .filter((point) => point.x > 0 && point.y > 0)
          .map((point) => ({
            value: [point.x, point.y],
            title: point.title,
          })),
      })),
    };

    chart.setOption(options);

    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.dispose();
    };
  }, [chartData, chartId]);

  return (
    <div
      ref={containerRef}
      id={chartId}
      style={{ width: "100%", flex: 1, minHeight: 0 }}
    />
  );
};
