import { DoraMetricsChart } from "../components/dora-metrics-chart/dora-metrics-chart";
import { Paper, Skeleton } from "@mantine/core";
import { useWorkspace } from "../../../providers/workspace.provider";
import { useOutletContext } from "react-router-dom";
import { DoraMetricFilters } from "../types";
import { useDoraMetrics } from "../useDoraMetrics";

export const DoraMttrPage = () => {
  const { workspace } = useWorkspace();
  const filters = useOutletContext<DoraMetricFilters>();
  const { isLoading, metrics } = useDoraMetrics({
    workspaceId: workspace.id,
    filters,
  });

  if (isLoading || !metrics.meanTimeToRecover) {
    return <Skeleton height={400} />;
  }

  return (
    <>
      <Paper withBorder bg="dark.6" h={400} p="xs">
        <DoraMetricsChart
          chartData={{
            columns: metrics.meanTimeToRecover.columns,
            series: [
              {
                name: "MTTR",
                data: metrics.meanTimeToRecover.data,
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
