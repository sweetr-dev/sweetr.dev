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
import { UTCDate } from "@date-fns/utc";

const PR_FLOW_GROUP = "prFlow";

interface ChartSizeDistributionProps {
  chartId: string;
  chartData?: PullRequestSizeDistributionChartData | null;
  period: Period;
  onColumnClick?: (columnDate: string) => void;
}

export const ChartSizeDistribution = ({
  chartId,
  chartData,
  period,
  onColumnClick,
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
        padding: [0, 15],
        textStyle: { color: "#fff", fontSize: 14 },
        formatter(params) {
          if (!Array.isArray(params) || params.length === 0) return "";
          const idx = params[0].dataIndex!;
          const dateLabel = formatTooltipDate(
            new UTCDate(chartData.columns[idx]),
            period,
          );

          let total = 0;
          const sizeItems: { name: string; color: string; value: number }[] = [];
          let avgLinesValue = 0;

          for (const p of params) {
            if (p.seriesName === "Avg. Lines Changed") {
              avgLinesValue = Number(p.value) || 0;
              continue;
            }
            const val = Number(p.value) || 0;
            total += val;
            sizeItems.push({ name: p.seriesName!, color: p.color as string, value: val });
          }

          let html = `<div style="padding: 5px 0; font-weight:600">${dateLabel}</div>`;

          html += `<div style="margin: 0 -15px; padding: 5px 15px; border-top:1px solid #404040;">`;
          for (const item of sizeItems) {
            html += `<div style="display:flex;align-items:center;gap:5px;margin-bottom:2px">`;
            html += `<span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${item.color}"></span>`;
            html += `<span style="padding-right: 40px;">${item.name}</span>`;
            html += `<span style="margin-left:auto;font-weight:500">${item.value}</span>`;
            html += `</div>`;
          }
          html += `</div>`;

          html += `<div style="margin: 0 -15px; padding: 5px 15px; border-top:1px solid #404040; display:flex; align-items:center; gap:5px;">`;
          html += `<span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:#373A40"></span>`;
          html += `<span style="padding-right: 40px;">Total</span>`;
          html += `<span style="margin-left:auto;font-weight:600">${total}</span>`;
          html += `</div>`;

          html += `<div style="margin: 0 -15px; padding: 5px 15px; border-top:1px solid #404040; display:flex; align-items:center; gap:5px;">`;
          html += `<span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:#FFF"></span>`;
          html += `<span style="padding-right: 40px;">Avg. Lines Changed</span>`;
          html += `<span style="margin-left:auto;font-weight:500">${avgLinesValue}</span>`;
          html += `</div>`;

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
              Tiny: "XS",
              Small: "S",
              Medium: "M",
              Large: "L",
              Huge: "XL",
              "Avg. Lines ": "Avg. Lines Changed",
            }[name] || name
          );
        },
        bottom: 0,
        textStyle: { color: "#C1C2C5", fontSize: 12 },
        itemGap: 16,
        icon: "roundRect",
        itemWidth: 16,
        itemHeight: 12,
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
          name: chartSeries.name,
          data: chartSeries.data,
          color: chartSeries.color || undefined,
          type: "bar" as const,
          stack: "Total",
          yAxisIndex: 0,
          barMaxWidth: 24,
          itemStyle: {
            borderColor: "#1A1B1E",
            borderWidth: 1,
          },
          emphasis: { focus: "series" as const },
        })),
        {
          name: "Avg. Lines Changed",
          data: chartData.averageLinesChanged,
          type: "line" as const,
          smooth: true,
          symbol: "circle",
          symbolSize: 5,
          yAxisIndex: 1,
          lineStyle: { width: 2, color: "#FFF" },
          itemStyle: { color: "#FFF" },
          z: 10,
        },
      ],
    };

    chart.setOption(options);

    if (onColumnClick) {
      chart.getZr().on("click", (e) => {
        if (!chart.containPixel("grid", [e.offsetX, e.offsetY])) return;
        const [dataIndex] = chart.convertFromPixel("grid", [
          e.offsetX,
          e.offsetY,
        ]);
        const col = chartData.columns[Math.round(dataIndex)];
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
