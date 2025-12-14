import { Period } from "@sweetr/graphql-types/frontend/graphql";
import { DoraMetricsChart } from "../components/dora-metrics-chart/dora-metrics-chart";
import { mockChartData } from "../mockData";
import { Paper } from "@mantine/core";

export const DoraMttrPage = () => {
  return (
    <>
      <Paper withBorder bg="dark.6" h={400} p="xs">
        <DoraMetricsChart
          chartData={{
            columns: mockChartData.columns,
            series: [
              {
                name: mockChartData.mttr.name,
                data: mockChartData.mttr.data,
                color: mockChartData.mttr.color,
              },
            ],
          }}
          period={Period.DAILY}
        />
      </Paper>
    </>
  );
};
