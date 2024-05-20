import {
  Paper,
  Group,
  Stack,
  Title,
  Text,
  Tooltip,
  Avatar,
  useMantineTheme,
  Anchor,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconFlame, IconMessage } from "@tabler/icons-react";
import { IconPullRequestState } from "./icon-pull-request-state";
import {
  PullRequestSize,
  PullRequestState,
} from "@sweetr/graphql-types/frontend/graphql";
import { formatRelative } from "date-fns";
import { LinesChanged } from "../lines-changed/lines-changed";
import { BadgeCodeReviewTime } from "./badge-code-review-time";
import { BadgeMergeTime } from "./badge-merge-time";
import { BadgePullRequestSize } from "../badge-pull-request-size/badge-pull-request-size";

interface CardPullRequestProps {
  title: string;
  state: PullRequestState;
  comments: number;
  url: string;
  repositoryName: string;
  createdAt: Date;
  closedAt?: Date;
  mergedAt?: Date;
  firstReviewAt?: Date;
  size: PullRequestSize;
  timeToFirstReview?: number;
  timeToFirstApproval?: number;
  timeToMerge?: number;
  author?: {
    name: string;
    avatar: string;
  };
  changes: {
    additions: number;
    deletions: number;
    files: number;
  };
}

export const CardPullRequest = ({
  title,
  state,
  url,
  repositoryName,
  createdAt,
  closedAt,
  mergedAt,
  author,
  changes,
  comments,
  size,
  firstReviewAt,
  timeToFirstReview,
  timeToFirstApproval,
  timeToMerge,
}: CardPullRequestProps) => {
  const theme = useMantineTheme();
  const isSmallScreen = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  const getTimeLabel = () => {
    const openedAtLabel = `Opened ${formatRelative(createdAt, new Date())}`;

    if (mergedAt) return `Merged ${formatRelative(mergedAt, new Date())}`;

    if (closedAt) return `Closed ${formatRelative(closedAt, new Date())}`;

    return openedAtLabel;
  };

  const getCommentFlameProps = (comments: number) => {
    if (comments >= 30) {
      return { color: theme.colors.red[7], fill: theme.colors.red[7] };
    }

    if (comments >= 20) {
      return { color: theme.colors.red[6] };
    }

    return { color: theme.colors.red[4] };
  };

  return (
    <Anchor href={url} underline="never" c="dark.0" target="_blank">
      <Paper p="xs" radius="md" withBorder className="grow-on-hover">
        <Group justify="space-between" wrap={isSmallScreen ? "wrap" : "nowrap"}>
          <Group wrap="nowrap">
            <IconPullRequestState state={state} />
            <Stack gap={0}>
              <Group gap="xs" wrap="nowrap">
                <Title order={4} c="dark.3" textWrap="nowrap">
                  {repositoryName}
                </Title>
                <Title order={4} lineClamp={1}>
                  {title}
                </Title>
              </Group>

              <Group gap={4} mt={2}>
                <Text c="dimmed" size="xs">
                  {getTimeLabel()}
                </Text>
              </Group>
            </Stack>
          </Group>

          <Group
            gap="xl"
            wrap="nowrap"
            style={{ flexGrow: 1 }}
            justify={isSmallScreen ? "center" : "flex-end"}
          >
            {author && (
              <Tooltip label={author.name} withArrow position="top">
                <Avatar src={author.avatar} size={32} />
              </Tooltip>
            )}

            <Group gap={4} miw={40} justify="flex-start">
              {comments > 10 ? (
                <IconFlame
                  stroke={1.5}
                  size={16}
                  {...getCommentFlameProps(comments)}
                />
              ) : (
                <IconMessage stroke={1.5} size={16} />
              )}

              <Text size="sm" fw={500}>
                {comments}
              </Text>
            </Group>

            <BadgePullRequestSize
              size={size}
              tooltip={<LinesChanged {...changes} />}
            />

            <Stack gap={4} miw={28} mih={61} justify="center">
              {state !== PullRequestState.CLOSED && (
                <>
                  <BadgeCodeReviewTime
                    timeToFirstReview={timeToFirstReview}
                    timeToFirstApproval={timeToFirstApproval}
                    firstReviewAt={firstReviewAt}
                    mergedAt={mergedAt}
                  />
                  {timeToMerge && (
                    <BadgeMergeTime
                      timeToMerge={timeToMerge}
                      mergedAt={mergedAt}
                    />
                  )}
                </>
              )}
            </Stack>
          </Group>
        </Group>
      </Paper>
    </Anchor>
  );
};
