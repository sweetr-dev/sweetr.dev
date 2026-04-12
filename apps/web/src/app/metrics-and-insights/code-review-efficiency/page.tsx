import { Group, Paper, Skeleton, Table } from "@mantine/core";
import { LoadableContent } from "../../../components/loadable-content";
import { useForm } from "@mantine/form";
import { Period } from "@sweetr/graphql-types/frontend/graphql";
import { IconCalendarFilled, IconRefresh } from "@tabler/icons-react";
import { endOfToday } from "date-fns";
import { Breadcrumbs } from "../../../components/breadcrumbs";
import { FilterDate } from "../../../components/filter-date";
import { FilterMultiSelect } from "../../../components/filter-multi-select";
import { FilterSelect } from "../../../components/filter-select";
import { PageContainer } from "../../../components/page-container";
import {
  useRepositoryAsyncOptions,
  useTeamAsyncOptions,
} from "../../../providers/async-options.provider";
import {
  parseNullableISO,
  thirtyDaysAgo,
} from "../../../providers/date.provider";
import { useFilterSearchParameters } from "../../../providers/filter.provider";
import { IconRepository, IconTeam } from "../../../providers/icon.provider";
import { useWorkspace } from "../../../providers/workspace.provider";
import { useCodeReviewDistributionWorkspaceQuery } from "../../../api/code-review-efficiency-metrics.api";
import { PageEmptyState } from "../../../components/page-empty-state";
import { AvatarUser } from "../../../components/avatar-user";
import { ChartCodeReviewDistribution } from "../../humans/teams/[id]/health-and-performance/components/chart-code-review-distribution";
import { CodeReviewEfficiencyFilters } from "./types";

export const CodeReviewEfficiencyPage = () => {
  const searchParams = useFilterSearchParameters();
  const { workspace } = useWorkspace();

  const filters = useForm<CodeReviewEfficiencyFilters>({
    initialValues: {
      from: searchParams.get("from") || thirtyDaysAgo().toISOString(),
      to: searchParams.get("to") || endOfToday().toISOString(),
      teamIds: searchParams.getAll<string[]>("team") || [],
      repositoryIds: searchParams.getAll<string[]>("repository") || [],
      period: (searchParams.get("period") as Period) || Period.WEEKLY,
    },
  });

  const queryInput = {
    dateRange: {
      from: filters.values.from,
      to: filters.values.to,
    },
    period: filters.values.period,
    teamIds: filters.values.teamIds.length ? filters.values.teamIds : undefined,
    repositoryIds: filters.values.repositoryIds.length
      ? filters.values.repositoryIds
      : undefined,
  };

  const queryArgs = { workspaceId: workspace.id, input: queryInput };

  const { data, isLoading } = useCodeReviewDistributionWorkspaceQuery(
    queryArgs,
  );
  const codeReviewDistribution =
    data?.workspace.metrics?.prFlow?.codeReviewDistribution;

  const isEmpty = !codeReviewDistribution?.entities.length && !isLoading;

  const reviewers = codeReviewDistribution?.entities.filter(
    (entity) => entity.reviewCount !== null,
  );

  return (
    <PageContainer size="lg">
      <Breadcrumbs items={[{ label: "Metrics & Insights" }]} />

      <Group gap={5}>
        <FilterDate
          label="Date range"
          icon={IconCalendarFilled}
          onChange={(dates) => {
            const from = dates[0]?.toISOString() || null;
            const to = dates[1]?.toISOString() || null;
            filters.setFieldValue("from", from);
            filters.setFieldValue("to", to);
            searchParams.setMany({ from, to });
          }}
          value={[
            parseNullableISO(filters.values.from) || null,
            parseNullableISO(filters.values.to) || null,
          ]}
        />
        <FilterMultiSelect
          label="Team"
          icon={IconTeam}
          asyncController={useTeamAsyncOptions}
          withSearch
          value={filters.values.teamIds}
          onChange={(value) => {
            filters.setFieldValue("teamIds", value);
            searchParams.set("team", value);
          }}
        />
        <FilterMultiSelect
          label="Repository"
          icon={IconRepository}
          asyncController={useRepositoryAsyncOptions}
          withSearch
          value={filters.values.repositoryIds}
          capitalize={false}
          onChange={(value) => {
            filters.setFieldValue("repositoryIds", value);
            searchParams.set("repository", value);
          }}
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
            if (!value) return;
            filters.setFieldValue("period", value as Period);
            searchParams.set("period", value);
          }}
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
              chartData={codeReviewDistribution}
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
                      <AvatarUser
                        src={reviewer.image}
                        size={24}
                        name={reviewer.name}
                      />
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
    </PageContainer>
  );
};
