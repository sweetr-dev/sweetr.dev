import { Paper, Skeleton } from "@mantine/core";
import { DoraMetricsChart } from "../components/dora-metrics-chart/dora-metrics-chart";
import { useDoraMetrics } from "../useDoraMetrics";
import { useWorkspace } from "../../../providers/workspace.provider";
import { useOutletContext } from "react-router-dom";
import { DoraMetricFilters } from "../types";

export const DoraFailureRatePage = () => {
  const { workspace } = useWorkspace();
  const filters = useOutletContext<DoraMetricFilters>();
  const { isLoading, metrics } = useDoraMetrics({
    workspaceId: workspace.id,
    filters,
  });

  if (isLoading || !metrics.changeFailureRate) {
    return <Skeleton height={400} />;
  }

  return (
    <>
      <Paper withBorder bg="dark.6" h={400} p="xs">
        <DoraMetricsChart
          chartData={{
            columns: metrics.changeFailureRate.columns,
            series: [
              {
                name: "Failure Rate",
                data: metrics.changeFailureRate.data,
                color: "#8ce99a",
              },
            ],
          }}
          period={filters.period}
        />
      </Paper>
    </>
  );
};
