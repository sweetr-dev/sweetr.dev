import { Paper } from "@mantine/core";
import { DoraMetricsChart } from "../components/dora-metrics-chart/dora-metrics-chart";
import { mockChartData } from "../mockData";
import { Period } from "@sweetr/graphql-types/frontend/graphql";

export const DoraFailureRatePage = () => {
  return (
    <>
      <Paper withBorder bg="dark.6" h={400} p="xs">
        <DoraMetricsChart
          chartData={{
            columns: mockChartData.columns,
            series: [
              {
                name: mockChartData.failureRate.name,
                data: mockChartData.failureRate.data,
                color: mockChartData.failureRate.color,
              },
            ],
          }}
          period={Period.DAILY}
        />
      </Paper>
    </>
  );
};
