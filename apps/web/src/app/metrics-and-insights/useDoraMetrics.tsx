import { useDoraMetricsQuery } from "../../api/dora-metrics.api";
import { DoraMetricFilters } from "./types";

interface UseDoraMetricsProps {
  workspaceId: string;
  filters: DoraMetricFilters;
}

export const useDoraMetrics = ({
  filters,
  workspaceId,
}: UseDoraMetricsProps) => {
  const { from, to, ...filter } = filters;

  const { data, isLoading } = useDoraMetricsQuery({
    workspaceId,
    input: {
      ...filter,
      dateRange: {
        from,
        to,
      },
    },
  });

  const dora = data?.workspace?.metrics?.dora;

  return {
    metrics: {
      deploymentFrequency: dora?.deploymentFrequency,
      leadTime: dora?.leadTime,
      changeFailureRate: dora?.changeFailureRate,
      meanTimeToRecover: dora?.meanTimeToRecover,
    },
    isLoading,
  };
};
