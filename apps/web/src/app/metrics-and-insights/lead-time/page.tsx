import { DoraMetricsChart } from "../components/dora-metrics-chart/dora-metrics-chart";
import { Paper, Skeleton } from "@mantine/core";
import { useOutletContext } from "react-router-dom";
import { useWorkspace } from "../../../providers/workspace.provider";
import { useDoraMetrics } from "../useDoraMetrics";
import { DoraMetricFilters } from "../types";

export const DoraLeadTimePage = () => {
  const { workspace } = useWorkspace();
  const filters = useOutletContext<DoraMetricFilters>();
  const { isLoading, metrics } = useDoraMetrics({
    workspaceId: workspace.id,
    filters,
  });

  if (isLoading || !metrics.leadTime) {
    return <Skeleton height={400} />;
  }

  return (
    <>
      <Paper withBorder bg="dark.6" h={400} p="xs">
        <DoraMetricsChart
          chartData={{
            columns: metrics.leadTime.columns,
            series: [
              {
                name: "Lead Time",
                data: metrics.leadTime.data,
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
