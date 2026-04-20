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
import { getAbbreviatedDuration } from "../../../../../providers/date.provider";
import { UTCDate } from "@date-fns/utc";

const CR_GROUP = "codeReviewEfficiency";

interface ChartTimeToApprovalProps {
  chartId: string;
  chartData?: NumericChartData | null;
  period: Period;
  onColumnClick?: (columnDate: string) => void;
}

export const ChartTimeToApproval = ({
  chartId,
  chartData,
  period,
  onColumnClick,
}: ChartTimeToApprovalProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartData || !containerRef.current) return;

    const { columns, data } = chartData;
    if (!columns.length) return;

    const chart = echarts.init(containerRef.current, "dark");
    chart.group = CR_GROUP;
    echarts.connect(CR_GROUP);

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
            new UTCDate(columns[idx]),
            period,
          );
          const val = Number(data[idx]) || 0;
          const duration = val ? getAbbreviatedDuration(val) : "0s";

          let html = `<div style="padding: 5px 0; font-weight:600">${dateLabel}</div>`;
          html += `<div style="margin: 0 -15px; padding: 5px 15px; border-top:1px solid #404040; display:flex; align-items:center; gap:5px;">`;
          html += `<span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:#b197fc"></span>`;
          html += `<span style="padding-right: 40px;">Time to Approval</span>`;
          html += `<span style="margin-left:auto;font-weight:500">${duration}</span>`;
          html += `</div>`;

          return html;
        },
        axisPointer: { type: "shadow" },
      },
      grid: {
        left: "0",
        right: "0",
        bottom: "10px",
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
      series: [
        {
          type: "bar",
          data: data.map((v) => Number(v)),
          color: "#b197fc",
          barMaxWidth: 24,
          itemStyle: {
            borderColor: "#1A1B1E",
            borderWidth: 1,
          },
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
        const col = columns[Math.round(dataIndex)];
        if (col) onColumnClick(col);
      });
      chart.getZr().on("mousemove", (e) => {
        chart
          .getZr()
          .setCursorStyle(
            chart.containPixel("grid", [e.offsetX, e.offsetY])
              ? "pointer"
              : "default",
          );
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
