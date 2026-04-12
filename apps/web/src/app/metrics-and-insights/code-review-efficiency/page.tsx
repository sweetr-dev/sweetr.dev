import { Divider, Group, SimpleGrid, Skeleton } from "@mantine/core";
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
import { usePrFlowMetricsQuery } from "../../../api/pr-flow-metrics.api";
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

  const { data, isLoading } = usePrFlowMetricsQuery(queryArgs);
  const prFlow = data?.workspace.metrics?.prFlow;

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

      <Divider mt="xl" mb="md" label="Pull Request" labelPosition="left" />

      <LoadableContent
        isLoading={isLoading}
        whenLoading={
          <SimpleGrid cols={2}>
            <Skeleton h={340} />
            <Skeleton h={340} />
            <Skeleton h={340} />
            <Skeleton h={340} />
            <Skeleton h={340} />
            <Skeleton h={340} />
            <Skeleton h={340} style={{ gridColumn: "span 2" }} />
          </SimpleGrid>
        }
        content={<>The content</>}
      />
    </PageContainer>
  );
};
