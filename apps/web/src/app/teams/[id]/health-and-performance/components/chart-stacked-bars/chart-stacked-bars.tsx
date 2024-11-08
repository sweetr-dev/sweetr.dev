import { useEffect } from "react";
import {
  ECOption,
  echarts,
  formatAxisDate,
  formatTooltipDate,
} from "../../../../../../providers/echarts.provider";
import {
  NumericSeriesChartData,
  Period,
} from "@sweetr/graphql-types/frontend/graphql";
import { CallbackDataParams } from "echarts/types/dist/shared";

interface ChartStackedBarProps {
  chartData?: NumericSeriesChartData | null;
  period: Period;
}

type Arrayable<T> = T | T[];

export const ChartStackedBars = ({
  chartData,
  period,
}: ChartStackedBarProps) => {
  useEffect(() => {
    if (!chartData) return;

    const chart = echarts.init(document.getElementById("main"), "dark");

    const options: ECOption = {
      backgroundColor: "#25262B",
      tooltip: {
        trigger: "axis",
        backgroundColor: "#25262B",
        borderColor: "#303030",
        padding: [10, 0],
        textStyle: {
          color: "#fff",
          fontSize: 16,
        },
        formatter: function (params: Arrayable<CallbackDataParams>) {
          let total = 0;
          let tooltipContent = `<div style="padding: 0 15px; ">${(params as any)[0].axisValueLabel}</div>`;

          (params as Array<CallbackDataParams>).forEach(function (item) {
            total += item.value as number;
            tooltipContent += `<div style="padding: 0 15px; ">${item.marker} ${item.seriesName}: ${item.value}</div>`;
          });

          tooltipContent += `<div style="padding: 5px 15px 0 15px; margin-top: 5px; border-top: 1px solid #373A40;"><div style="height: 10px; width: 10px; border-radius: 50%; background-color: #373A40; display: inline-block; margin-right: 10px;"></div>Total: ${total}</div>`;

          return tooltipContent;
        },
        axisPointer: {
          label: {
            formatter({ value }) {
              return formatTooltipDate(new Date(value), period);
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
        data: chartData.columns,
        axisLabel: {
          formatter(value: string) {
            return formatAxisDate(new Date(value), period);
          },
        },
      },
      legend: {
        data: ["Tiny", "Small", "Medium", "Large", "Huge"],
      },
      yAxis: {
        min: 0,
      },
      series: chartData.series.map((chartSeries) => ({
        barCategoryGap: "50%",
        barGap: "50%",
        name: chartSeries.name,
        data: chartSeries.data,
        color: chartSeries.color || undefined,
        smooth: true,
        emphasis: { focus: "series" },
        symbolSize: 7,
        type: "bar",
        stack: "Total",
      })),
    };

    chart.setOption(options);
    chart.renderToCanvas();
  }, [chartData, period]);

  return <div id="main" style={{ width: "100%", height: "100%" }}></div>;
};
