import { useEffect, useRef, useState } from "react";
import {
  ECOption,
  echarts,
  formatAxisDate,
  formatTooltipDate,
} from "../../../../../providers/echarts.provider";
import {
  NumericSeriesChartData,
  Period,
} from "@sweetr/graphql-types/frontend/graphql";
import { UTCDate } from "@date-fns/utc";
import { Menu } from "@mantine/core";
import { IconGitMerge, IconGitPullRequest } from "@tabler/icons-react";

const PR_FLOW_GROUP = "prFlow";

export type ThroughputDateType = "created" | "completed";

interface ChartThroughputProps {
  chartId: string;
  chartData?: NumericSeriesChartData | null;
  period: Period;
  onColumnClick?: (columnDate: string, dateType: ThroughputDateType) => void;
}

export const ChartThroughput = ({
  chartId,
  chartData,
  period,
  onColumnClick,
}: ChartThroughputProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState<{
    x: number;
    y: number;
    columnDate: string;
  } | null>(null);

  useEffect(() => {
    if (!chartData || !containerRef.current) return;

    const chart = echarts.init(containerRef.current, "dark");
    chart.group = PR_FLOW_GROUP;
    echarts.connect(PR_FLOW_GROUP);

    const seriesMeta = chartData.series.map((s) => ({
      name: s.name,
      color: s.color || "#8ce99a",
    }));

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

          const opened = seriesMeta.find((s) => s.name === "Opened");
          const openedVal =
            Number(
              chartData.series.find((s) => s.name === "Opened")?.data[idx],
            ) || 0;

          const outcomeSeries = seriesMeta.filter(
            (s) => s.name === "Merged" || s.name === "Closed",
          );

          let html = `<div style="padding: 5px 0; font-weight:600">${dateLabel}</div>`;

          if (opened) {
            html += `<div style="margin: 0 -15px; padding: 5px 15px; border-top:1px solid #404040; display:flex; align-items:center; gap:5px;">`;
            html += `<span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${opened.color}"></span>`;
            html += `<span style="padding-right: 40px;">Opened</span>`;
            html += `<span style="margin-left:auto;font-weight:500">${openedVal}</span>`;
            html += `</div>`;
          }

          html += `<div style="margin: 0 -15px; padding: 5px 15px; border-top:1px solid #404040;">`;
          for (const meta of outcomeSeries) {
            const val =
              Number(
                chartData.series.find((s) => s.name === meta.name)?.data[idx],
              ) || 0;
            html += `<div style="display:flex;align-items:center;gap:5px;margin-bottom:2px">`;
            html += `<span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${meta.color}"></span>`;
            html += `<span style="padding-right: 40px;">${meta.name}</span>`;
            html += `<span style="margin-left:auto;font-weight:500">${val}</span>`;
            html += `</div>`;
          }
          html += `</div>`;

          return html;
        },
        axisPointer: {
          type: "shadow",
        },
      },
      legend: {
        show: true,
        bottom: 0,
        textStyle: { color: "#C1C2C5", fontSize: 12 },
        itemGap: 16,
        icon: "roundRect",
        itemWidth: 16,
        itemHeight: 12,
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
      yAxis: {
        min: 0,
        minInterval: 1,
      },
      series: chartData.series.map((chartSeries) => {
        const isStacked =
          chartSeries.name === "Merged" || chartSeries.name === "Closed";
        return {
          name: chartSeries.name,
          type: "bar" as const,
          stack: isStacked ? "outcome" : undefined,
          data: chartSeries.data,
          color: chartSeries.color || undefined,
          barMaxWidth: 24,
          itemStyle: {
            borderColor: "#1A1B1E",
            borderWidth: 1,
          },
          emphasis: { focus: "series" as const },
        };
      }),
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
        if (!col) return;

        const rect = containerRef.current!.getBoundingClientRect();
        setMenu({
          x: rect.left + e.offsetX,
          y: rect.top + e.offsetY,
          columnDate: col,
        });
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
    <div style={{ width: "100%", flex: 1, minHeight: 0, position: "relative" }}>
      <div
        ref={containerRef}
        id={chartId}
        style={{ width: "100%", height: "100%" }}
      />
      <Menu
        opened={!!menu}
        onChange={(opened) => {
          if (!opened) setMenu(null);
        }}
        position="bottom-start"
        shadow="md"
        withArrow
      >
        <Menu.Target>
          <div
            style={{
              position: "fixed",
              left: menu?.x ?? 0,
              top: menu?.y ?? 0,
              width: 0,
              height: 0,
              pointerEvents: "none",
            }}
          />
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>View Pull Requests</Menu.Label>
          <Menu.Item
            leftSection={<IconGitPullRequest size={16} stroke={1.5} />}
            onClick={() => {
              if (menu) onColumnClick?.(menu.columnDate, "created");
              setMenu(null);
            }}
          >
            Opened
          </Menu.Item>
          <Menu.Item
            leftSection={<IconGitMerge size={16} stroke={1.5} />}
            onClick={() => {
              if (menu) onColumnClick?.(menu.columnDate, "completed");
              setMenu(null);
            }}
          >
            Merged / Closed
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </div>
  );
};
