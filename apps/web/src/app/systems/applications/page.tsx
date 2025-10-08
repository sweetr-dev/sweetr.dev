import { Box, Button, Group, Skeleton, Stack } from "@mantine/core";
import { IconBox } from "@tabler/icons-react";
import { Breadcrumbs } from "../../../components/breadcrumbs";
import { FilterMultiSelect } from "../../../components/filter-multi-select";
import { LoadableContent } from "../../../components/loadable-content";
import { PageContainer } from "../../../components/page-container";
import { PageEmptyState } from "../../../components/page-empty-state";
import { CardApplication } from "./components/card-application";
import { HeaderActions } from "../../../components/header-actions";
import { Application } from "@sweetr/graphql-types/frontend/graphql";
import { useInfiniteLoading } from "../../../providers/pagination.provider";
import { LoaderInfiniteScroll } from "../../../components/loader-infinite-scroll";
import { useFilterSearchParameters } from "../../../providers/filter.provider";
import { useWorkspace } from "../../../providers/workspace.provider";
import { useForm } from "@mantine/form";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useContextualActions } from "../../../providers/contextual-actions.provider";
import { useHotkeys } from "@mantine/hooks";
import { useApplicationsInfiniteQuery } from "../../../api/applications.api";
import { useTeamAsyncOptions } from "../../../providers/async-options.provider";
import { IconTeam } from "../../../providers/icon.provider";
import { InputSearch } from "../../../components/input-search";

export const ApplicationsPage = () => {
  const { workspace } = useWorkspace();
  const searchParams = useFilterSearchParameters();
  const filters = useForm<{
    teamIds: string[];
  }>({
    initialValues: {
      teamIds: searchParams.getAll<string[]>("team") || [],
    },
  });
  const navigate = useNavigate();

  useHotkeys([
    [
      "n",
      () => {
        navigate(`/systems/applications/new/?${searchParams.toString()}`);
      },
    ],
  ]);

  useContextualActions(
    {
      newApplication: {
        label: "New application",
        description: "Create a new application",
        icon: IconBox,
        onClick: () => {
          navigate(`/systems/applications/new/?${searchParams.toString()}`);
        },
      },
    },
    [searchParams.toString()],
  );

  const {
    data,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isFetchedAfterMount,
  } = useApplicationsInfiniteQuery(
    {
      input: {
        teamIds: filters.values.teamIds,
      },
      workspaceId: workspace?.id,
    },
    {
      initialPageParam: undefined,
      getNextPageParam: (lastPage) => {
        const lastApplication = lastPage.workspace.applications.at(-1);

        return lastApplication?.id || undefined;
      },
    },
  );

  const { ref } = useInfiniteLoading({
    onIntersect: () => {
      if (isFetching || isFetchingNextPage) return;

      fetchNextPage();
    },
  });

  const applications = data?.pages
    .flatMap((page) => page.workspace.applications)
    .filter((application): application is Application => !!application);

  const isLoading =
    (isFetching && !applications) ||
    (isFetchedAfterMount &&
      isFetching &&
      (applications?.length === 0 || !applications));
  const isEmpty = !!(applications && applications.length === 0 && !isLoading);
  const isFiltering = Object.keys(searchParams.values).length > 0;

  return (
    <PageContainer>
      <Breadcrumbs items={[{ label: "Applications" }]} />

      <HeaderActions>
        <Group>
          <InputSearch />
          <Link to={`/systems/applications/new/?${searchParams.toString()}`}>
            <Button variant="light">New</Button>
          </Link>
        </Group>
      </HeaderActions>

      <Group gap={5}>
        <FilterMultiSelect
          label="Owner"
          icon={IconTeam}
          asyncController={useTeamAsyncOptions}
          withSearch
          value={filters.values.teamIds}
          onChange={(value) => {
            filters.setFieldValue("teamIds", value);
            searchParams.set("team", value);
          }}
        />
      </Group>

      <LoadableContent
        mt="md"
        isLoading={isLoading}
        isEmpty={isEmpty}
        whenLoading={
          <Stack>
            <Skeleton height={20} />
            <Skeleton height={85} />
            <Skeleton height={85} />
            <Skeleton height={85} />
            <Skeleton height={85} />
            <Skeleton height={85} />
            <Skeleton height={85} />
          </Stack>
        }
        whenEmpty={
          <Box mt={80}>
            <PageEmptyState
              message="No applications found."
              isFiltering={isFiltering}
              onResetFilter={() => {
                filters.setValues({
                  teamIds: [],
                });
                searchParams.reset();
              }}
            />
          </Box>
        }
        content={
          <Stack>
            <Box
              display="grid"
              style={{
                justifyContent: "space-between",
                gap: "var(--stack-gap, var(--mantine-spacing-md))",
              }}
              mt="md"
            >
              {applications?.map((application) => (
                <CardApplication
                  key={application.id}
                  application={application}
                />
              ))}
            </Box>

            {hasNextPage && <LoaderInfiniteScroll ref={ref} />}
          </Stack>
        }
      />

      <Outlet />
    </PageContainer>
  );
};
