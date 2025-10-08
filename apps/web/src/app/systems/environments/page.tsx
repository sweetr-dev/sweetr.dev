import { Box, Button, Skeleton, Stack } from "@mantine/core";
import { Breadcrumbs } from "../../../components/breadcrumbs";
import { PageContainer } from "../../../components/page-container";
import { useWorkspace } from "../../../providers/workspace.provider";
import { Fragment } from "react/jsx-runtime";
import { LoadableContent } from "../../../components/loadable-content";
import { PageEmptyState } from "../../../components/page-empty-state";
import { useInfiniteLoading } from "../../../providers/pagination.provider";
import { LoaderInfiniteScroll } from "../../../components/loader-infinite-scroll";
import { Environment } from "@sweetr/graphql-types/frontend/graphql";
import { useEnvironmentsInfiniteQuery } from "../../../api/environments.api";
import { CardEnvironment } from "./components/card-environment";
import { HeaderActions } from "../../../components/header-actions";
import { useInfoModal } from "../../../providers/modal.provider";
import { ButtonDocs } from "../../../components/button-docs";

export const EnvironmentsPage = () => {
  const { workspace } = useWorkspace();

  const {
    data,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isFetchedAfterMount,
  } = useEnvironmentsInfiniteQuery(
    {
      input: { includeArchived: true },
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

      <LoadableContent
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
            <PageEmptyState message="No environments found." />
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
