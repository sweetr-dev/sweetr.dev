import { useEffect } from "react";
import {
  ECOption,
  echarts,
  formatAxisDate,
  formatTooltipDate,
} from "../../../../providers/echarts.provider";
import { Period } from "@sweetr/graphql-types/frontend/graphql";
import { UTCDate } from "@date-fns/utc";

interface DoraMetricsChartData {
  columns: string[];
  series: {
    name: string;
    data: number[];
    color?: string;
  }[];
}

interface DoraMetricsChartProps {
  chartData?: DoraMetricsChartData | null;
  period: Period;
}

export const DoraMetricsChart = ({
  chartData,
  period,
}: DoraMetricsChartProps) => {
  useEffect(() => {
    if (!chartData) return;

    const chart = echarts.init(document.getElementById("dora-chart"), "dark");

    const options: ECOption = {
      backgroundColor: "#25262B",
      tooltip: {
        trigger: "axis",
        backgroundColor: "#25262B",
        borderColor: "#303030",
        padding: [10, 15],
        textStyle: {
          color: "#fff",
          fontSize: 16,
        },
        valueFormatter(value) {
          if (typeof value === "number") {
            return value.toFixed(2);
          }
          return value;
        },
        axisPointer: {
          label: {
            formatter({ value }) {
              return formatTooltipDate(new UTCDate(value), period);
            },
          },
        },
      },
      legend: {
        data: chartData.series.map((s) => s.name),
        textStyle: {
          color: "#fff",
        },
        top: 10,
      },
      grid: {
        left: "1%",
        right: "4%",
        bottom: "3%",
        top: "15%",
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
            return value.toFixed(1);
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
        lineStyle: {
          width: 3,
        },
        areaStyle: {
          opacity: 0.3,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: series.color || "#8ce99a",
            },
            {
              offset: 1,
              color: "rgba(1, 191, 236, 0)",
            },
          ]),
        },
      })),
    };

    chart.setOption(options);
    chart.renderToCanvas();
  }, [chartData, period]);

  return <div id="dora-chart" style={{ width: "100%", height: "100%" }}></div>;
};
