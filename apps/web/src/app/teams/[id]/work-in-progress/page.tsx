import { Stack, Skeleton, Divider, Group, Badge, Anchor } from "@mantine/core";
import { CardPullRequest } from "../../../../components/card-pull-request";
import { useWorkspace } from "../../../../providers/workspace.provider";
import { LoadableContent } from "../../../../components/loadable-content/loadable-content";
import { useTeamId } from "../use-team";
import { useTeamPullRequestsInProgressQuery } from "../../../../api/teams.api";
import { TeamPullRequestsInProgressQuery } from "@sweetr/graphql-types/frontend/graphql";
import { Link } from "react-router-dom";
import { Tip } from "../../../../components/tip";

type PullRequestGroup = Exclude<
  keyof NonNullable<
    TeamPullRequestsInProgressQuery["workspace"]["team"]
  >["pullRequestsInProgress"],
  "__typename"
>;

export const TeamWorkInProgressPage = () => {
  const teamId = useTeamId();
  const { workspace } = useWorkspace();

  const { data, isFetching, isFetchedAfterMount } =
    useTeamPullRequestsInProgressQuery({
      teamId,
      workspaceId: workspace?.id,
    });

  const groupedPullRequests = data?.workspace.team?.pullRequestsInProgress;

  const isLoading =
    (isFetching && !groupedPullRequests) ||
    (isFetchedAfterMount && isFetching && !groupedPullRequests);

  const sectionTitle: Record<PullRequestGroup, string> = {
    drafted: "🚧 Drafted",
    pendingReview: "⏳ Pending Review",
    changesRequested: "📝 Changes Requested",
    pendingMerge: "🚀 Pending Merge",
  };

  return (
    <>
      <LoadableContent
        mt="md"
        isLoading={isLoading}
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
        content={
          <Stack gap="lg">
            <Anchor
              component={Link}
              to={`/teams/${teamId}/digests/wip`}
              c="dimmed"
              underline="hover"
            >
              <Tip justify="end">
                Schedule WIP Digest to send this report to your team&apos;s
                Slack channel.
              </Tip>
            </Anchor>
            {groupedPullRequests &&
              (
                Object.entries(sectionTitle) as [PullRequestGroup, string][]
              ).map(([key, title]) => {
                const pullRequests = groupedPullRequests[key];

                return (
                  <Stack key={key}>
                    <Divider
                      label={
                        <>
                          <Group gap={5} align="center">
                            {title}
                            <Badge variant="default" size="xs">
                              {pullRequests.length}
                            </Badge>
                          </Group>
                        </>
                      }
                      labelPosition="left"
                      styles={{
                        label: { fontSize: "var(--mantine-font-size-sm)" },
                      }}
                    />

                    {pullRequests.length > 0 && (
                      <Stack>
                        {pullRequests.map((pullRequest) => (
                          <CardPullRequest
                            key={pullRequest.id}
                            pullRequest={pullRequest}
                            timeFormat="ago"
                          />
                        ))}
                      </Stack>
                    )}
                  </Stack>
                );
              })}
          </Stack>
        }
      />
    </>
  );
};
