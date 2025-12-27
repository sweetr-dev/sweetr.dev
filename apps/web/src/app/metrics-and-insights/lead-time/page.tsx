import { Paper, Skeleton } from "@mantine/core";
import { useOutletContext } from "react-router-dom";
import { useWorkspace } from "../../../providers/workspace.provider";
import { ChartAverageTime } from "../../humans/teams/[id]/health-and-performance/components/chart-average-time";
import { DoraMetricFilters } from "../types";
import { useDoraMetrics } from "../useDoraMetrics";

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
        <ChartAverageTime
          chartData={{
            columns: metrics.leadTime.columns,
            data: metrics.leadTime.data,
          }}
          period={filters.period}
        />
      </Paper>
    </>
  );
};
