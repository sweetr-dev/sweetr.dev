import { useEffect } from "react";
import {
  ECOption,
  echarts,
  formatAxisDate,
  formatTooltipDate,
} from "../../../../../../../providers/echarts.provider";
import {
  NumericChartData,
  Period,
} from "@sweetr/graphql-types/frontend/graphql";
import { formatMsDuration } from "../../../../../../../providers/date.provider";
import { UTCDate } from "@date-fns/utc";
interface ChartAverageTimeProps {
  chartData?: NumericChartData | null;
  period: Period;
}

export const ChartAverageTime = ({
  chartData,
  period,
}: ChartAverageTimeProps) => {
  const max = Math.max(...(chartData?.data || []), 0) / 1000 / 60 / 60;

  useEffect(() => {
    if (!chartData) return;

    const chart = echarts.init(document.getElementById("main"), "dark");

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
          if (!value) return "0 hours";

          return formatMsDuration(parseInt(value as string), [
            "years",
            "months",
            "weeks",
            "days",
            "hours",
            "minutes",
          ]);
        },
        axisPointer: {
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
  }, [chartData, period, max]);

  return <div id="main" style={{ width: "100%", height: "100%" }}></div>;
};
