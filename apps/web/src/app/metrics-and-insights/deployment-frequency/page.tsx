import { DoraMetricsChart } from "../components/dora-metrics-chart/dora-metrics-chart";
import { Paper, Skeleton } from "@mantine/core";
import { useOutletContext } from "react-router-dom";
import { DoraMetricFilters } from "../types";
import { useWorkspace } from "../../../providers/workspace.provider";
import { useDoraMetrics } from "../useDoraMetrics";

export const DoraDeploymentFrequencyPage = () => {
  const filters = useOutletContext<DoraMetricFilters>();
  const { workspace } = useWorkspace();

  const { isLoading, metrics } = useDoraMetrics({
    workspaceId: workspace.id,
    filters,
  });

  if (isLoading || !metrics.deploymentFrequency) {
    return <Skeleton height={400} />;
  }

  return (
    <>
      <Paper withBorder bg="dark.6" h={400} p="xs">
        <DoraMetricsChart
          chartData={{
            columns: metrics.deploymentFrequency.columns,
            series: [
              {
                name: "Deployment Frequency",
                data: metrics.deploymentFrequency.data,
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
