import { DrawerScrollable } from "../../../../../../../components/drawer-scrollable";
import { Avatar, Box, Group, Paper, Skeleton, Table } from "@mantine/core";
import { useDrawerPage } from "../../../../../../../providers/drawer-page.provider";
import { useForm } from "@mantine/form";
import { useFilterSearchParameters } from "../../../../../../../providers/filter.provider";
import { IconCalendar } from "@tabler/icons-react";
import { FilterDate } from "../../../../../../../components/filter-date";
import { parseNullableISO } from "../../../../../../../providers/date.provider";
import { LoadableContent } from "../../../../../../../components/loadable-content";
import { CardInfo } from "../../../../../../../components/card-info";
import { useCodeReviewDistributionQuery } from "../../../../../../../api/chart.api";
import { useWorkspace } from "../../../../../../../providers/workspace.provider";
import { Period } from "@sweetr/graphql-types/frontend/graphql";
import { PageEmptyState } from "../../../../../../../components/page-empty-state";
import { ChartCodeReviewDistribution } from "../../components/chart-code-review-distribution";
import { ButtonDocs } from "../../../../../../../components/button-docs";
import { useTeamId } from "../../../use-team";
import { startOfDay, subDays, endOfToday } from "date-fns";

export const TeamCodeReviewDistributionPage = () => {
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

  const { data, isLoading } = useCodeReviewDistributionQuery({
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
    !data?.workspace.charts?.codeReviewDistribution?.entities.length &&
    !isLoading;

  const reviewers =
    data?.workspace.charts?.codeReviewDistribution?.entities.filter(
      (entity) => entity.reviewCount !== null,
    );

  return (
    <>
      <DrawerScrollable
        {...drawerProps}
        title="Code review distribution"
        toolbar={
          <ButtonDocs href="http://docs.sweetr.dev/features/team/code-review-distribution" />
        }
      >
        <Box p="md">
          <CardInfo>Understand the feedback circle in your team.</CardInfo>

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
          </Group>
          <Paper withBorder h={500} p="xs" mt="md" bg="dark.6">
            <LoadableContent
              isLoading={isLoading}
              whenLoading={<Skeleton h="100%" />}
              h="100%"
              display="flex"
              content={
                <ChartCodeReviewDistribution
                  chartData={data?.workspace.charts?.codeReviewDistribution}
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

          {!isEmpty && (
            <Paper mt="md" withBorder p="xs" bg="dark.6">
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Reviewer</Table.Th>
                    <Table.Th ta="right">Reviews</Table.Th>
                    <Table.Th ta="right">%</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {reviewers?.map((reviewer) => (
                    <Table.Tr key={reviewer.id}>
                      <Table.Td>
                        <Group gap="xs">
                          <Avatar src={reviewer.image} size={24} />
                          {reviewer.name}
                        </Group>
                      </Table.Td>
                      <Table.Td align="right">{reviewer.reviewCount}</Table.Td>
                      <Table.Td align="right">
                        {reviewer.reviewSharePercentage}%
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Paper>
          )}
        </Box>
      </DrawerScrollable>
    </>
  );
};
