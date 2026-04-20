import { useEffect, useRef } from "react";
import { ECOption, echarts } from "../../../../../providers/echarts.provider";
import { ScatterChartData } from "@sweetr/graphql-types/frontend/graphql";

const svgIcon = (paths: string, color = "#909296") =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;

const ICON_PR = svgIcon(
  '<path d="M4 18a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/><path d="M4 6a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/><path d="M16 18a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/><path d="M6 8l0 8"/><path d="M11 6h5a2 2 0 0 1 2 2v8"/><path d="M14 9l-3 -3l3 -3"/>',
);
const ICON_COMMENT = svgIcon(
  '<path d="M3 20l1.3 -3.9c-2.324 -3.437 -1.426 -7.872 2.1 -10.374c3.526 -2.501 8.59 -2.296 11.845 .48c3.255 2.777 3.695 7.266 1.029 10.501c-2.666 3.235 -7.615 4.215 -11.574 2.293l-4.7 1"/>',
);
const ICON_FILE_DIFF = svgIcon(
  '<path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2"/><path d="M12 10l0 4"/><path d="M10 12l4 0"/><path d="M10 17l4 0"/>',
);

interface ChartSizeCommentCorrelationProps {
  chartId: string;
  chartData?: ScatterChartData | null;
}

export const ChartSizeCommentCorrelation = ({
  chartId,
  chartData,
}: ChartSizeCommentCorrelationProps) => {
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
        padding: [0, 15],
        textStyle: { color: "#fff", fontSize: 14 },
        formatter(params) {
          const p = Array.isArray(params) ? params[0] : params;
          const data = p.data as {
            value: number[];
            title?: string;
            url?: string;
          };
          const lines = data.value[0];
          const comments = data.value[1];
          const color = p.color as string;

          let html = "";

          html += `<div style="padding: 5px 0; font-weight:600; display:flex; align-items:center; gap:6px;">`;
          if (data.title) {
            html += `${ICON_PR} <span style="padding-right: 40px; max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${data.title}</span>`;
          }
          html += `<span style="margin-left:auto; display:inline-flex; align-items:center; gap:4px; white-space:nowrap;"><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${color}"></span>${p.seriesName}</span>`;
          html += `</div>`;

          html += `<div style="margin: 0 -15px; padding: 5px 15px; border-top:1px solid #404040; display:flex; align-items:center; gap:5px;">`;
          html += `${ICON_FILE_DIFF}`;
          html += `<span style="padding-right: 40px;">Lines Changed</span>`;
          html += `<span style="margin-left:auto;font-weight:500">${lines.toLocaleString()}</span>`;
          html += `</div>`;

          html += `<div style="margin: 0 -15px; padding: 5px 15px; border-top:1px solid #404040; display:flex; align-items:center; gap:5px;">`;
          html += `${ICON_COMMENT}`;
          html += `<span style="padding-right: 40px;">Comments</span>`;
          html += `<span style="margin-left:auto;font-weight:500">${comments}</span>`;
          html += `</div>`;

          return html;
        },
      },
      legend: {
        data: ["Tiny", "Small", "Medium", "Large", "Huge"],
        bottom: 0,
        formatter(name) {
          return (
            {
              Tiny: "XS",
              Small: "S",
              Medium: "M",
              Large: "L",
              Huge: "XL",
            }[name] || name
          );
        },
        textStyle: { color: "#C1C2C5", fontSize: 12 },
        itemGap: 16,
        icon: "roundRect",
        itemWidth: 16,
        itemHeight: 12,
      },
      grid: {
        left: "30px",
        right: "0px",
        bottom: "60px",
        top: "15px",
        containLabel: true,
      },
      xAxis: {
        type: "log",
        name: "Lines Changed",
        nameLocation: "middle",
        nameGap: 30,
        min: 1,
        axisLabel: {
          formatter(value: number) {
            if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
            return String(value);
          },
        },
      },
      yAxis: {
        type: "value",
        name: "Comments",
        nameLocation: "middle",
        nameGap: 40,
        min: 0,
        minInterval: 1,
      },
      series: chartData.series.map((s) => ({
        name: s.name,
        type: "scatter" as const,
        color: s.color || undefined,
        symbolSize: 12,
        itemStyle: { opacity: 0.75 },
        data: s.data
          .filter((point) => point.x > 0)
          .map((point) => ({
            value: [point.x, point.y],
            title: point.title,
            url: point.url,
          })),
      })),
    };

    chart.setOption(options);

    chart.on("click", (params) => {
      const data = params.data as { url?: string } | undefined;
      if (data?.url) {
        window.open(data.url, "_blank", "noopener,noreferrer");
      }
    });

    chart.getZr().on("mousemove", (e) => {
      const el = containerRef.current;
      if (!el) return;
      el.style.cursor = chart.containPixel("grid", [e.offsetX, e.offsetY])
        ? "pointer"
        : "default";
    });

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
