import { Box, Button, Group, Skeleton, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { Environment } from "@sweetr/graphql-types/frontend/graphql";
import { Fragment } from "react/jsx-runtime";
import { useEnvironmentsInfiniteQuery } from "../../../api/environments.api";
import { Breadcrumbs } from "../../../components/breadcrumbs";
import { ButtonDocs } from "../../../components/button-docs";
import {
  FilterArchivedOnly,
  FilterOptions,
} from "../../../components/filter-options";
import { HeaderActions } from "../../../components/header-actions";
import { LoadableContent } from "../../../components/loadable-content";
import { LoaderInfiniteScroll } from "../../../components/loader-infinite-scroll";
import { PageContainer } from "../../../components/page-container";
import { PageEmptyState } from "../../../components/page-empty-state";
import { useFilterSearchParameters } from "../../../providers/filter.provider";
import { useInfoModal } from "../../../providers/modal.provider";
import { useInfiniteLoading } from "../../../providers/pagination.provider";
import { useWorkspace } from "../../../providers/workspace.provider";
import { CardEnvironment } from "./components/card-environment";

export const EnvironmentsPage = () => {
  const { workspace } = useWorkspace();
  const searchParams = useFilterSearchParameters();
  const filters = useForm<{ archivedOnly: boolean }>({
    initialValues: {
      archivedOnly: searchParams.get("archivedOnly") === "true",
    },
  });
  const isFiltering = Object.keys(searchParams.values).length > 0;

  const {
    data,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isFetchedAfterMount,
  } = useEnvironmentsInfiniteQuery(
    {
      input: { archivedOnly: filters.values.archivedOnly },
      workspaceId: workspace?.id,
    },
    {
      initialPageParam: undefined,
      getNextPageParam: (lastPage) => {
        const lastEnvironment = lastPage.workspace.environments.at(-1);

        return lastEnvironment?.id || undefined;
      },
    },
  );

  const { ref } = useInfiniteLoading({
    onIntersect: () => {
      if (isFetching || isFetchingNextPage) return;

      fetchNextPage();
    },
  });

  const environments = data?.pages
    .flatMap((page) => page.workspace.environments)
    .filter((environment): environment is Environment => !!environment);

  const isLoading =
    (isFetching && !environments) ||
    (isFetchedAfterMount &&
      isFetching &&
      (environments?.length === 0 || !environments));
  const isEmpty = !!(environments && environments.length === 0 && !isLoading);

  const { openInfoModal } = useInfoModal();

  return (
    <PageContainer>
      <Breadcrumbs items={[{ label: "Environments" }]} />

      <HeaderActions>
        <Button
          variant="light"
          onClick={() => {
            openInfoModal({
              title: "New Environment",
              label: (
                <Stack>
                  Environments are automatically created for you when you deploy
                  an application.
                  <ButtonDocs
                    href="https://docs.sweetr.dev/features/environments"
                    variant="light"
                  />
                </Stack>
              ),
            });
          }}
        >
          New
        </Button>
      </HeaderActions>

      <Group gap={5}>
        <FilterOptions isFiltering={filters.values.archivedOnly}>
          <FilterArchivedOnly
            checked={filters.values.archivedOnly}
            onChange={(value) => {
              filters.setFieldValue("archivedOnly", value);
              searchParams.set("archivedOnly", value ? "true" : null);
            }}
          />
        </FilterOptions>
      </Group>

      <LoadableContent
        mt="md"
        isLoading={isLoading}
        isEmpty={isEmpty}
        whenLoading={
          <Stack>
            <Skeleton height={40} />
            <Skeleton height={60} />
            <Skeleton height={60} />
            <Skeleton height={60} />
            <Skeleton height={60} />
            <Skeleton height={60} />
            <Skeleton height={60} />
          </Stack>
        }
        whenEmpty={
          <Box mt={80}>
            <PageEmptyState
              message="No environments found."
              isFiltering={isFiltering}
              onResetFilter={() => {
                filters.setValues({ archivedOnly: false });
                searchParams.reset();
              }}
            />
          </Box>
        }
        content={
          <Stack>
            {environments?.map((environment) => {
              return (
                <Fragment key={environment.id}>
                  <CardEnvironment environment={environment} />
                </Fragment>
              );
            })}
            {hasNextPage && <LoaderInfiniteScroll ref={ref} />}
          </Stack>
        }
      />
    </PageContainer>
  );
};
