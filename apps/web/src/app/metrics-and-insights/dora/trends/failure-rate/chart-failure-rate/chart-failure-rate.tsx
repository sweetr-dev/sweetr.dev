import { UTCDate } from "@date-fns/utc";
import { Period } from "@sweetr/graphql-types/frontend/graphql";
import { useEffect } from "react";
import {
  ECOption,
  echarts,
  escapeHtml,
  formatAxisDate,
  formatTooltipDate,
} from "../../../../../../providers/echarts.provider";

interface ChartFailureRateData {
  columns: string[];
  series: { name: string; data: number[]; color?: string }[];
}

interface ChartFailureRateProps {
  chartData?: ChartFailureRateData | null;
  period: Period;
  id?: string;
}

export const ChartFailureRate = ({
  chartData,
  period,
  id: chartId = "chart-failure-rate",
}: ChartFailureRateProps) => {
  useEffect(() => {
    if (!chartData) return;

    const chart = echarts.init(document.getElementById(chartId), "dark");

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
          let html = `<div style="padding: 5px 0; font-weight:600">${escapeHtml(dateLabel)}</div>`;
          html += `<div style="margin: 0 -15px; padding: 5px 15px; border-top:1px solid #404040;">`;
          for (const p of params) {
            const raw = p.value;
            const display = raw == null || Array.isArray(raw) ? "" : `${raw}%`;
            const color = (p.color as string) || "#8ce99a";
            const sName = p.seriesName ?? "";
            html += `<div style="display:flex;align-items:center;gap:5px;margin-bottom:2px">`;
            html += `<span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${color}"></span>`;
            html += `<span style="padding-right: 40px;">${escapeHtml(sName)}</span>`;
            html += `<span style="margin-left:auto;font-weight:500">${escapeHtml(display)}</span>`;
            html += `</div>`;
          }
          html += `</div>`;
          return html;
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
        show: false,
      },
      grid: {
        left: "0",
        right: "0",
        bottom: "40px",
        top: "15px",
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
            return parseFloat(value).toFixed(1);
          },
        },
      },
      series: chartData.series.map((series) => ({
        type: "line",
        name: series.name,
        data: series.data,
        smooth: true,
        emphasis: { focus: "series" },
        color: series.color || "#8ce99a",
        symbolSize: 7,
        lineStyle: { width: 2 },
        areaStyle: {
          opacity: 0.2,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: series.color || "#8ce99a" },
            { offset: 1, color: "rgba(1, 191, 236, 0)" },
          ]),
        },
      })),
    };

    chart.setOption(options);
    chart.renderToCanvas();
  }, [chartData, period]);

  return <div id={chartId} style={{ width: "100%", height: "100%" }}></div>;
};
