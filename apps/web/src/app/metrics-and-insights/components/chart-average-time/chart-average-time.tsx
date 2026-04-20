import { useEffect } from "react";
import {
  ECOption,
  echarts,
  formatAxisDate,
  formatTooltipDate,
} from "../../../../providers/echarts.provider";
import {
  NumericChartData,
  Period,
} from "@sweetr/graphql-types/frontend/graphql";
import { formatMsDuration } from "../../../../providers/date.provider";
import { UTCDate } from "@date-fns/utc";
interface ChartAverageTimeProps {
  chartData?: NumericChartData | null;
  period: Period;
  /** Shown in the chart legend and tooltip (e.g. Lead Time, MTTR). */
  seriesName: string;
}

export const ChartAverageTime = ({
  chartData,
  period,
  seriesName,
}: ChartAverageTimeProps) => {
  const max = Math.max(...(chartData?.data || []), 0) / 1000 / 60 / 60;

  useEffect(() => {
    if (!chartData) return;

    const chart = echarts.init(document.getElementById("main"), "dark");

    const options: ECOption = {
      backgroundColor: "transparent",
      legend: {
        show: false,
      },
      tooltip: {
        trigger: "axis",
        backgroundColor: "#25262B",
        borderColor: "#303030",
        padding: [0, 15],
        textStyle: {
          color: "#fff",
          fontSize: 14,
        },
        formatter(params) {
          if (!Array.isArray(params) || params.length === 0) return "";
          const p = params[0];
          const idx = p.dataIndex!;
          const dateLabel = formatTooltipDate(
            new UTCDate(chartData.columns[idx]),
            period,
          );
          const formatVal = (value: unknown) => {
            if (!value) return "0 hours";
            const ms = parseInt(String(value), 10);
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
          const valueStr = formatVal(p.value);
          const color = (p.color as string) || "#8ce99a";
          let html = `<div style="padding: 5px 0; font-weight:600">${dateLabel}</div>`;
          html += `<div style="margin: 0 -15px; padding: 5px 15px; border-top:1px solid #404040; display:flex; align-items:center; gap:5px;">`;
          html += `<span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${color}"></span>`;
          html += `<span style="padding-right: 40px;">${seriesName}</span>`;
          html += `<span style="margin-left:auto;font-weight:500">${valueStr}</span>`;
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
      grid: {
        left: "1%",
        right: "4%",
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
            const hours = parseInt(value) / 1000 / 60 / 60;

            return `${hours.toFixed(0)} h`;
          },
        },
      },
      series: [
        {
          type: "line",
          name: seriesName,
          data: chartData.data,
          smooth: true,
          emphasis: { focus: "series" },
          color: "#8ce99a",
          symbolSize: 7,
          lineStyle: {
            width: 3,
          },
          areaStyle: {
            opacity: 0.8,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: "#8ce99a",
              },
              {
                offset: 1,
                color: "rgba(1, 191, 236, 0)",
              },
            ]),
          },
        },
      ],
    };

    chart.setOption(options);
    chart.renderToCanvas();
  }, [chartData, period, max, seriesName]);

  return <div id="main" style={{ width: "100%", height: "100%" }}></div>;
};
