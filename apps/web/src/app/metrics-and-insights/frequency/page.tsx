import { Period } from "@sweetr/graphql-types/frontend/graphql";
import { DoraMetricsChart } from "../components/dora-metrics-chart/dora-metrics-chart";
import { mockChartData } from "../mockData";
import { Paper } from "@mantine/core";

export const DoraFrequencyPage = () => {
  return (
    <>
      <Paper withBorder bg="dark.6" h={400} p="xs">
        <DoraMetricsChart
          chartData={{
            columns: mockChartData.columns,
            series: [
              {
                name: mockChartData.frequency.name,
                data: mockChartData.frequency.data,
                color: mockChartData.frequency.color,
              },
            ],
          }}
          period={Period.DAILY}
        />
      </Paper>
    </>
  );
};
