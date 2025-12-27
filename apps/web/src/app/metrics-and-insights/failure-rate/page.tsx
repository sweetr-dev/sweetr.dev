import { Paper, Skeleton } from "@mantine/core";
import { useOutletContext } from "react-router-dom";
import { useWorkspace } from "../../../providers/workspace.provider";
import { DoraMetricFilters } from "../types";
import { useDoraMetrics } from "../useDoraMetrics";
import { ChartFailureRate } from "./chart-failure-rate/chart-failure-rate";

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
        <ChartFailureRate
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
