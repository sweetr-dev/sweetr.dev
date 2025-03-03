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
  HoverCard,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconFlame, IconMessage } from "@tabler/icons-react";
import { IconPullRequestState } from "./icon-pull-request-state";
import { Person, PullRequest } from "@sweetr/graphql-types/frontend/graphql";
import { LinesChanged } from "../lines-changed/lines-changed";
import { BadgePullRequestSize } from "../badge-pull-request-size/badge-pull-request-size";
import classes from "./card-pull-request.module.css";
import { getPullRequestChanges } from "../../providers/pull-request.provider";
import { usePrCard } from "./use-pr-card";
import { BadgeStatus } from "./badge-status";
import { BadgeData, useBadges } from "./use-badges";
import { TimelinePullRequest } from "./timeline-pull-request";

interface CardPullRequestProps {
  pullRequest: Omit<PullRequest, "author"> & {
    author: Pick<Person, "name" | "avatar">;
  };
}

export const CardPullRequest = ({ pullRequest }: CardPullRequestProps) => {
  const theme = useMantineTheme();
  const isSmallScreen = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  const { getCommentFlameProps, getTimeLabel } = usePrCard(pullRequest);

  const { getCardColor, badges } = useBadges(pullRequest);

  const cardColor = getCardColor();

  return (
    <HoverCard position="right" offset={5} withArrow>
      <HoverCard.Target>
        <Anchor
          href={pullRequest.gitUrl}
          underline="never"
          c="dark.0"
          target="_blank"
        >
          <Paper
            p="md"
            pl="lg"
            radius="md"
            withBorder
            className={`${classes.card} grow-on-hover`}
            style={{
              ["--borderWidth"]: cardColor ? "2px" : 0,
              ["--startColor"]: cardColor?.start,
              ["--endColor"]: cardColor?.end,
            }}
          >
            <Group
              justify="space-between"
              wrap={isSmallScreen ? "wrap" : "nowrap"}
            >
              <Group wrap="nowrap">
                <Stack gap="xs">
                  <Group gap="xs" wrap="nowrap">
                    <Title order={4} c="dark.3" textWrap="nowrap">
                      {pullRequest.repository.name}
                    </Title>
                    <Title order={4} lineClamp={1} title={pullRequest.title}>
                      {pullRequest.title}
                    </Title>
                  </Group>

                  <Group gap="xs">
                    <Group justify="center" align="center" gap={5}>
                      <IconPullRequestState state={pullRequest.state} />
                      <Text size="sm" c="dimmed">
                        {getTimeLabel()}
                      </Text>
                    </Group>

                    {(
                      Object.values(badges).filter(
                        Boolean,
                      ) as NonNullable<BadgeData>[]
                    ).map((badge) => (
                      <BadgeStatus
                        key={badge.label}
                        variant={badge.variant}
                        icon={badge.icon}
                      >
                        {badge.label}
                      </BadgeStatus>
                    ))}
                  </Group>
                </Stack>
              </Group>

              <Group
                gap="xl"
                wrap="nowrap"
                justify={isSmallScreen ? "center" : "flex-end"}
              >
                {pullRequest.author && (
                  <Tooltip
                    label={pullRequest.author.name}
                    withArrow
                    position="top"
                  >
                    <Avatar src={pullRequest.author.avatar} size={40} />
                  </Tooltip>
                )}

                <Group gap={5} miw={40} justify="flex-start" align="center">
                  {pullRequest.commentCount > 10 ? (
                    <IconFlame
                      stroke={1.5}
                      size={20}
                      {...getCommentFlameProps(pullRequest.commentCount)}
                    />
                  ) : (
                    <IconMessage stroke={1} size={20} />
                  )}

                  <Text size="md" fw={500}>
                    {pullRequest.commentCount}
                  </Text>
                </Group>

                <BadgePullRequestSize
                  size={pullRequest.tracking.size}
                  tooltip={
                    <LinesChanged {...getPullRequestChanges(pullRequest)} />
                  }
                />
              </Group>
            </Group>
          </Paper>
        </Anchor>
      </HoverCard.Target>
      <HoverCard.Dropdown bg="dark.7" w="auto" p="lg">
        <TimelinePullRequest pullRequest={pullRequest} />
      </HoverCard.Dropdown>
    </HoverCard>
  );
};
