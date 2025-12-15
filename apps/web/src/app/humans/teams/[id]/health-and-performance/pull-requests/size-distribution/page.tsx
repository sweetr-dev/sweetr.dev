import { DrawerScrollable } from "../../../../../../../components/drawer-scrollable";
import { Box, Group, Paper, Skeleton } from "@mantine/core";
import { useDrawerPage } from "../../../../../../../providers/drawer-page.provider";
import { FilterSelect } from "../../../../../../../components/filter-select";
import { useForm } from "@mantine/form";
import { useFilterSearchParameters } from "../../../../../../../providers/filter.provider";
import { IconCalendarFilled, IconRefresh } from "@tabler/icons-react";
import { FilterDate } from "../../../../../../../components/filter-date";
import { parseNullableISO } from "../../../../../../../providers/date.provider";
import { LoadableContent } from "../../../../../../../components/loadable-content";
import { CardInfo } from "../../../../../../../components/card-info";
import { usePullRequestSizeDistributionQuery } from "../../../../../../../api/pull-request-metrics.api";
import { useWorkspace } from "../../../../../../../providers/workspace.provider";
import { Period } from "@sweetr/graphql-types/frontend/graphql";
import { PageEmptyState } from "../../../../../../../components/page-empty-state";
import { ResourceNotFound } from "../../../../../../../exceptions/resource-not-found.exception";
import { ChartStackedBars } from "../../components/chart-stacked-bars";
import { ButtonDocs } from "../../../../../../../components/button-docs";
import { useTeamId } from "../../../use-team";
import { startOfDay, subDays, endOfToday } from "date-fns";

export const TeamPullRequestsSizeDistribution = () => {
  const teamId = useTeamId();
  const { workspace } = useWorkspace();
  const drawerProps = useDrawerPage({
    closeUrl: `/humans/teams/${teamId}/health-and-performance/`,
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

  const { data, isLoading } = usePullRequestSizeDistributionQuery({
    workspaceId: workspace.id,
    input: {
      dateRange: {
        from: filters.values.from,
        to: filters.values.to,
      },
      period: filters.values.period as Period,
      teamId,
    },
  });

  const isEmpty =
    data?.workspace.metrics?.pullRequestSizeDistribution?.series.every(
      (seriesData) => seriesData.data.length === 0,
    ) && !isLoading;

  return (
    <>
      <DrawerScrollable
        {...drawerProps}
        title="Pull Request size distribution"
        toolbar={
          <ButtonDocs href="http://docs.sweetr.dev/features/team/pr-size-distribution" />
        }
      >
        <Box p="md">
          <CardInfo>
            Track the size distribution of Pull Requests across the team.
          </CardInfo>

          <Group mt="md" wrap="nowrap" gap={5}>
            <FilterDate
              label="Date range"
              icon={IconCalendarFilled}
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
                <ChartStackedBars
                  chartData={
                    data?.workspace.metrics?.pullRequestSizeDistribution
                  }
                  period={filters.values.period}
                />
              }
              style={
                isEmpty
                  ? { alignItems: "center", justifyContent: "center" }
                  : undefined
              }
              isEmpty={isEmpty}
              whenEmpty={<PageEmptyState message="No data available." />}
            />
          </Paper>
        </Box>
      </DrawerScrollable>
    </>
  );
};
