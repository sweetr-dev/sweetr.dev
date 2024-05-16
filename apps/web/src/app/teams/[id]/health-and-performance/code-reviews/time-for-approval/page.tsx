import { useParams } from "react-router-dom";
import { DrawerScrollable } from "../../../../../../components/drawer-scrollable";
import { Accordion, Box, Button, Group, Paper, Skeleton } from "@mantine/core";
import { useChartDrawer } from "../../chart-page.provider";
import { FilterSelect } from "../../../../../../components/filter-select";
import { useForm } from "@mantine/form";
import { useFilterSearchParameters } from "../../../../../../providers/filter.provider";
import { IconBook2, IconCalendar, IconRefresh } from "@tabler/icons-react";
import { FilterDate } from "../../../../../../components/filter-date";
import { parseNullableISO } from "../../../../../../providers/date.provider";
import startOfDay from "date-fns/startOfDay";
import endOfToday from "date-fns/endOfToday";
import subDays from "date-fns/subDays";
import { LoadableContent } from "../../../../../../components/loadable-content";
import { CardInfo } from "../../../../../../components/card-info";
import { useChartTimeToApprovalQuery } from "../../../../../../api/chart.api";
import { useWorkspace } from "../../../../../../providers/workspace.provider";
import { Period } from "@sweetr/graphql-types/frontend/graphql";
import { ChartAverageTime } from "../../components/chart-average-time";
import { PageEmptyState } from "../../../../../../components/page-empty-state";
import { ResourceNotFound } from "../../../../../../exceptions/resource-not-found.exception";

export const TeamCodeReviewsTimeForApprovalPage = () => {
  const { teamId } = useParams();
  const { workspace } = useWorkspace();
  const drawerProps = useChartDrawer({
    closeUrl: `/teams/${teamId}/health-and-performance/`,
  });
  const searchParams = useFilterSearchParameters();
  const filters = useForm<{
    period: Period;
    from: string | null;
    to: string | null;
  }>({
    initialValues: {
      period: (searchParams.get("period") as Period) || Period.WEEKLY,
      from:
        searchParams.get("from") ||
        startOfDay(subDays(new Date(), 30)).toISOString(),
      to: searchParams.get("to") || endOfToday().toISOString(),
    },
  });

  if (!teamId) throw new ResourceNotFound();

  const { data, isLoading } = useChartTimeToApprovalQuery({
    workspaceId: workspace.id,
    chartInput: {
      dateRange: {
        from: filters.values.from,
        to: filters.values.to,
      },
      period: filters.values.period as Period,
      teamId,
    },
  });

  const isEmpty =
    !data?.workspace.charts?.timeForApproval?.data.length && !isLoading;

  return (
    <>
      <DrawerScrollable
        {...drawerProps}
        title="Time to approve"
        toolbar={
          <>
            <Button
              leftSection={<IconBook2 stroke={1.5} size={20} />}
              variant="subtle"
              color="dark.1"
            >
              Docs
            </Button>
          </>
        }
      >
        <Box p="md">
          <CardInfo>
            Track how long it takes for a Pull Request to be approved.
          </CardInfo>

          <Group mt="md" wrap="nowrap" gap={5}>
            <FilterDate
              label="Date range"
              icon={IconCalendar}
              onChange={(dates) => {
                const from = dates[0]?.toISOString() || null;
                const to = dates[1]?.toISOString() || null;

                filters.setFieldValue("from", from);
                filters.setFieldValue("to", to);
                searchParams.set("from", from);
                searchParams.set("to", to);
              }}
              value={[
                parseNullableISO(filters.values.from) || null,
                parseNullableISO(filters.values.to) || null,
              ]}
            />
            <FilterSelect
              label="Period"
              icon={IconRefresh}
              items={[
                Period.DAILY,
                Period.WEEKLY,
                Period.MONTHLY,
                Period.QUARTERLY,
                Period.YEARLY,
              ]}
              value={filters.values.period}
              onChange={(value) => {
                filters.setFieldValue("period", value as Period);
                searchParams.set("period", value);
              }}
            />
          </Group>
          <Paper withBorder h={400} p="xs" mt="md" bg="dark.6">
            <LoadableContent
              isLoading={isLoading}
              whenLoading={<Skeleton h="100%" />}
              h="100%"
              display="flex"
              content={
                <ChartAverageTime
                  chartData={data?.workspace.charts?.timeForApproval}
                  period={filters.values.period}
                />
              }
              style={
                isEmpty
                  ? { alignItems: "center", justifyContent: "center" }
                  : undefined
              }
              isEmpty={isEmpty}
              whenEmpty={<PageEmptyState message="No data available" />}
            />
          </Paper>
          <Accordion variant="contained" mt="md">
            <Accordion.Item value="improve">
              <Accordion.Control c="dimmed">
                Why monitor and improve this metric?
              </Accordion.Control>
              <Accordion.Panel>Content</Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value="data">
              <Accordion.Control c="dimmed">
                How is the data aggregated?
              </Accordion.Control>
              <Accordion.Panel>Content</Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </Box>
      </DrawerScrollable>
    </>
  );
};
