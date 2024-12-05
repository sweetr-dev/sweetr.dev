import {
  Paper,
  Group,
  Stack,
  Title,
  Text,
  Avatar,
  useMantineTheme,
  Tooltip,
  Anchor,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconMessage } from "@tabler/icons-react";
import { IconCodeReview } from "./icon-code-review";
import {
  CodeReviewState,
  PullRequestSize,
} from "@sweetr/graphql-types/frontend/graphql";
import { LinesChanged } from "../lines-changed/lines-changed";
import { BadgeFirstReview } from "./badge-code-review-time";
import { BadgePullRequestSize } from "../badge-pull-request-size";
import { formatRelative } from "date-fns";

interface CardCodeReviewProps {
  title: string;
  state: CodeReviewState;
  comments: number;
  prComments: number;
  createdAt: Date;
  repositoryName: string;
  prSize: PullRequestSize;
  prGitUrl: string;
  prFirstReviewAt?: Date;
  prTimeToFirstReview?: number;
  prAuthor: {
    name: string;
    avatar?: string;
  };
  prChanges: {
    additions: number;
    deletions: number;
    files: number;
  };
}

export const CardCodeReview = ({
  title,
  state,
  prChanges,
  prAuthor,
  comments,
  createdAt,
  repositoryName,
  prSize,
  prFirstReviewAt,
  prTimeToFirstReview,
  prGitUrl,
}: CardCodeReviewProps) => {
  const theme = useMantineTheme();
  const isSmallScreen = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const isFirstPRReview = prFirstReviewAt?.getTime() === createdAt.getTime();

  return (
    <Anchor href={prGitUrl} underline="never" c="dark.0" target="_blank">
      <Paper px="sm" py="md" radius="md" withBorder className="grow-on-hover">
        <Group justify="space-between" wrap={isSmallScreen ? "wrap" : "nowrap"}>
          <Group wrap="nowrap" style={{ flexGrow: 1 }}>
            <IconCodeReview state={state} />
            <Stack gap={0}>
              <Group gap="xs" wrap="nowrap">
                <Title order={4} c="dark.3" textWrap="nowrap">
                  {repositoryName}
                </Title>
                <Title order={4} lineClamp={1} title={title}>
                  {title}
                </Title>
              </Group>
              <Text c="dimmed" size="xs">
                Reviewed {formatRelative(createdAt, new Date())}
              </Text>
            </Stack>
          </Group>

          <Group
            gap="xl"
            wrap="nowrap"
            style={{ flexGrow: 1 }}
            justify={isSmallScreen ? "center" : "flex-end"}
          >
            <Group gap={4} miw={40} justify="flex-start" wrap="nowrap">
              <IconMessage stroke={1.5} size={16} />
              <Text size="sm" fw={500}>
                {comments}
              </Text>
            </Group>

            <Tooltip label={prAuthor.name} withArrow position="top">
              <Avatar src={prAuthor.avatar} size={24} />
            </Tooltip>

            <BadgePullRequestSize
              size={prSize}
              tooltip={<LinesChanged {...prChanges} />}
            />
            <Group miw={28}>
              {isFirstPRReview && prTimeToFirstReview && (
                <BadgeFirstReview timeToFirstReview={prTimeToFirstReview} />
              )}
            </Group>
          </Group>
        </Group>
      </Paper>
    </Anchor>
  );
};
