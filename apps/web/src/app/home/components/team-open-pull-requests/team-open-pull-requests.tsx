import {
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Skeleton,
  Stack,
} from "@mantine/core";
import { CardPullRequest } from "../../../../components/card-pull-request";
import {
  PullRequest,
  PullRequestOwnerType,
  PullRequestState,
} from "@sweetr/graphql-types/frontend/graphql";
import { useWorkspace } from "../../../../providers/workspace.provider";
import { usePullRequestsInfiniteQuery } from "../../../../api/pull-request.api";
import { useAuthenticatedUser } from "../../../../providers/auth.provider";
import { LoadableContent } from "../../../../components/loadable-content";
import { PageEmptyState } from "../../../../components/page-empty-state";
import { IconChecks } from "@tabler/icons-react";
import { useTeammatesQuery } from "../../../../api/teams.api";

export const TeamOpenPullRequests = () => {
  const { user } = useAuthenticatedUser();
  const { workspace } = useWorkspace();

  const { data: teammatesData } = useTeammatesQuery({
    workspaceId: workspace.id,
    handle: user.handle,
  });

  const {
    data,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isFetchedAfterMount,
  } = usePullRequestsInfiniteQuery(
    {
      input: {
        ownerIds:
          teammatesData?.workspace.person?.teammates.map(
            (teammate) => teammate.person.id,
          ) || [],
        ownerType: PullRequestOwnerType.PERSON,
        states: [PullRequestState.OPEN],
      },
      workspaceId: workspace.id,
    },
    {
      enabled: !!teammatesData,
      initialPageParam: undefined,
      getNextPageParam: (lastPage) => {
        const lastPullRequest = lastPage.workspace.pullRequests.at(-1);

        if (lastPage.workspace.pullRequests.length < 10) return undefined;

        return lastPullRequest?.id || undefined;
      },
    },
  );

  const pullRequests = data?.pages
    .flatMap((page) => page.workspace.pullRequests)
    .filter((pullRequest): pullRequest is PullRequest => !!pullRequest);

  const isLoading =
    (isFetching && !pullRequests) ||
    (isFetchedAfterMount &&
      isFetching &&
      (pullRequests?.length === 0 || !pullRequests));

  const isEmpty = !!(pullRequests && pullRequests.length === 0 && !isLoading);

  return (
    <Stack>
      <Divider
        label={
          <Group gap={5} align="center">
            💪 The team&apos;s open work
            <Badge variant="default" size="xs">
              {pullRequests?.length || 0}
            </Badge>
          </Group>
        }
        labelPosition="left"
        styles={{
          label: { fontSize: "var(--mantine-font-size-md)" },
        }}
      />
      <LoadableContent
        isLoading={isLoading}
        isEmpty={isEmpty}
        whenEmpty={
          <PageEmptyState
            message="Sweet, no team work waiting action."
            icon={IconChecks}
            iconColor="var(--mantine-color-green-5)"
          />
        }
        whenLoading={
          <Stack>
            <Skeleton height={85} />
            <Skeleton height={85} />
          </Stack>
        }
        content={
          <Stack>
            {pullRequests?.map((pullRequest) => (
              <CardPullRequest
                key={pullRequest.id}
                pullRequest={pullRequest}
                timeFormat="ago"
              />
            ))}
            {hasNextPage && (
              <Box ta="center">
                <Button
                  variant="outline"
                  fullWidth={false}
                  onClick={() => {
                    fetchNextPage();
                  }}
                  loading={isFetchingNextPage}
                >
                  Load more
                </Button>
              </Box>
            )}
          </Stack>
        }
      />
    </Stack>
  );
};
