import { Period } from "@sweetr/graphql-types/frontend/graphql";
import { mockChartData } from "../mockData";
import { DoraMetricsChart } from "../components/dora-metrics-chart/dora-metrics-chart";
import { Paper } from "@mantine/core";

export const DoraLeadTimePage = () => {
  return (
    <>
      <Paper withBorder bg="dark.6" h={400} p="xs">
        <DoraMetricsChart
          chartData={{
            columns: mockChartData.columns,
            series: [
              {
                name: mockChartData.leadTime.name,
                data: mockChartData.leadTime.data,
                color: mockChartData.leadTime.color,
              },
            ],
          }}
          period={Period.DAILY}
        />
      </Paper>
    </>
  );
};
