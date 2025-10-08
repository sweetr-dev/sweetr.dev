import { Box, SimpleGrid, Skeleton } from "@mantine/core";
import { Breadcrumbs } from "../../../components/breadcrumbs";
import { PageEmptyState } from "../../../components/page-empty-state";
import { CardPerson } from "../../../components/card-person";
import { HeaderActions } from "../../../components/header-actions";
import { InputSearch } from "../../../components/input-search";
import { IconInfo } from "../../../components/icon-info";
import { usePeopleInfiniteQuery } from "../../../api/people.api";
import { Person } from "@sweetr/graphql-types/frontend/graphql";
import { LoaderInfiniteScroll } from "../../../components/loader-infinite-scroll";
import { useInfiniteLoading } from "../../../providers/pagination.provider";
import { useWorkspace } from "../../../providers/workspace.provider";
import { PageContainer } from "../../../components/page-container";

export const PeoplePage = () => {
  const { workspace } = useWorkspace();

  const {
    data,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isLoading,
  } = usePeopleInfiniteQuery(
    {
      input: {},
      workspaceId: workspace.id,
    },
    {
      initialPageParam: undefined,
      getNextPageParam: (lastPage) => {
        const lastPerson = lastPage.workspace.people.at(-1);

        return lastPerson?.id || undefined;
      },
    },
  );

  const { ref } = useInfiniteLoading({
    onIntersect: () => {
      if (isFetching || isFetchingNextPage) return;

      fetchNextPage();
    },
  });

  const people = data?.pages
    .flatMap((page) => page.workspace.people)
    .filter((person): person is Person => !!person);

  const hasPeople = people && people.length > 0;

  return (
    <PageContainer>
      <Breadcrumbs items={[{ label: "People" }]}>
        <IconInfo tooltip="This list is automatically synced with GitHub." />
      </Breadcrumbs>
      <HeaderActions>
        <InputSearch />
      </HeaderActions>
      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
        {isLoading && <PageSkeleton />}

        {hasPeople &&
          people.map((person) => (
            <CardPerson
              key={person.id}
              name={person.name || person.handle}
              avatar={person.avatar || undefined}
              handle={person.handle}
            />
          ))}
      </SimpleGrid>
      {!isFetching && !hasPeople && (
        <PageEmptyState message="This workspace has no people." />
      )}
      {hasNextPage && (
        <Box mt="lg">
          <LoaderInfiniteScroll ref={ref} />
        </Box>
      )}
    </PageContainer>
  );
};

const PageSkeleton = (): JSX.Element => (
  <>
    <Skeleton height={182} />
    <Skeleton height={182} />
    <Skeleton height={182} />
    <Skeleton height={182} />
  </>
);
