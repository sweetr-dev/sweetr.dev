import { Paper, Skeleton } from "@mantine/core";
import { useOutletContext } from "react-router-dom";
import { useWorkspace } from "../../../providers/workspace.provider";
import { DoraMetricFilters } from "../types";
import { useDoraMetrics } from "../useDoraMetrics";
import { ChartDeploymentFrequency } from "./chart-deployment-frequency/chart-deployment-frequency";

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
        <ChartDeploymentFrequency
          chartData={{
            columns: metrics.deploymentFrequency.columns,
            series: [
              {
                name: "Deployments",
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
